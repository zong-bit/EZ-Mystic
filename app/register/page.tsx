'use client';

import { Suspense } from 'react';
import RegisterRedirectContent from './register-content';

export const dynamic = 'force-dynamic';

export default function RegisterRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-gold-primary text-4xl taiji-loader inline-block">☯</span>
          <p className="text-text-secondary text-sm mt-4">Redirecting...</p>
        </div>
      </div>
    }>
      <RegisterRedirectContent />
    </Suspense>
  );
}
