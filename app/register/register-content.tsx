'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      router.replace(`/signup?ref=${encodeURIComponent(ref)}`);
    } else {
      router.replace('/signup');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <span className="text-gold-primary text-4xl taiji-loader inline-block">☯</span>
        <p className="text-text-secondary text-sm mt-4">Redirecting...</p>
      </div>
    </div>
  );
}
