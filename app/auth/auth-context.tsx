'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '../../src/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // First, try to restore session from localStorage.
    // getSession() hangs on China→Supabase connections, so we use
    // localStorage as the primary fast-path and only fall back to
    // getSession() as a secondary check.
    const restoreFromLocalStorage = () => {
      try {
        const tokenStr = localStorage.getItem(
          'sb-xgaxejeaxfhlupguqteu-auth-token'
        );
        if (tokenStr) {
          const parsed = JSON.parse(tokenStr);
          const accessToken = parsed?.access_token;
          if (accessToken) {
            // Extract user from the JWT payload to avoid network call
            const payload = JSON.parse(
              Buffer.from(accessToken.split('.')[1], 'base64').toString()
            );
            if (payload?.sub) {
              setUser({ ...parsed.user, id: payload.sub } as User);
              setLoading(false);
              return true;
            }
          }
        }
      } catch {
        // Malformed token — fall through to getSession()
      }
      return false;
    };

    // Fast path: restore from localStorage
    if (restoreFromLocalStorage()) return;

    // Slow path: call getSession() with a timeout to avoid hanging forever.
    // If it times out, fall back to localStorage-based detection.
    let cancelled = false;
    const timeoutMs = 3000;

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        // getSession() timed out — try localStorage fallback
        const tokenStr = localStorage.getItem(
          'sb-xgaxejeaxfhlupguqteu-auth-token'
        );
        if (tokenStr) {
          try {
            const parsed = JSON.parse(tokenStr);
            const accessToken = parsed?.access_token;
            if (accessToken) {
              const payload = JSON.parse(
                Buffer.from(accessToken.split('.')[1], 'base64').toString()
              );
              if (payload?.sub) {
                setUser({ ...parsed.user, id: payload.sub } as User);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }
        // No localStorage token either — user is not logged in
        setUser(null);
        setLoading(false);
      }
    }, timeoutMs);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        clearTimeout(timeoutId);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch(() => {
      // getSession() failed entirely (network error, timeout, etc.)
      if (!cancelled) {
        clearTimeout(timeoutId);
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
