'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token) {
      // Token already present from Gumroad redirect
      setStatus('success');
      setMessage(`Your Destiny Book is ready! Token: ${token}`);
      return;
    }

    // No token yet — check webhook has processed
    if (email) {
      const checkToken = async () => {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from('gumroad_sales')
          .select('token')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data?.token) {
          setStatus('success');
          setMessage(`Your Destiny Book is ready! Token: ${data.token}`);
        } else {
          setStatus('loading');
          setTimeout(checkToken, 3000);
        }
      };
      setTimeout(checkToken, 3000);
    } else {
      setStatus('success');
      setMessage('Payment successful! Check your email for your activation details.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="absolute inset-0 starry-bg opacity-30" />
      <div className="relative glass-card max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4 animate-pulse">✨</div>
            <h1 className="font-display text-2xl font-bold text-gold-primary mb-2">Processing Your Order...</h1>
            <p className="text-text-secondary">Your Destiny Book is being prepared. This should only take a moment.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-display text-2xl font-bold text-gold-primary mb-2">Welcome to FateWise Pro!</h1>
            <p className="text-text-secondary mb-6">{message}</p>
            <div className="bg-gold-primary/10 border border-gold-primary/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-text-tertiary mb-1">Your Activation Token</p>
              <p className="text-gold-primary font-mono text-sm break-all">{message.split('Token: ')[1] || 'Check your email'}</p>
            </div>
            <Link href="/bazi" className="btn-primary w-full text-center py-3 block">
              Start Your Full Reading →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold text-gold-primary mb-2">Something's Off</h1>
            <p className="text-text-secondary mb-6">Your payment went through but we're still activating your account. Check your email or contact support.</p>
            <Link href="/bazi" className="btn-primary w-full text-center py-3 block">
              Try Your Free Reading First
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
