'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PaymentVerifyPage() {
  const [orderId, setOrderId] = useState('')
  const [step, setStep] = useState<'input' | 'verifying' | 'success' | 'error'>('input')
  const [message, setMessage] = useState('')
  const [claimResult, setClaimResult] = useState<{
    token?: string
    plan?: string
    expiresAt?: string | null
    email?: string
  }>({})

  const handleVerify = async () => {
    if (!orderId.trim() || orderId.trim().length < 6) {
      setMessage('Please enter a valid Gumroad order ID')
      setStep('error')
      return
    }

    setStep('verifying')
    setMessage('Verifying your purchase...')

    try {
      const response = await fetch('/api/gumroad-verify?order_id=' + encodeURIComponent(orderId.trim()), {
        method: 'GET',
      })
      const data = await response.json()

      if (!data.valid) {
        setMessage(data.error || 'Order not found. It may take a few minutes to sync.')
        setStep('error')
        return
      }

      // Now claim the token (no user session needed for just verification)
      const claimRes = await fetch('/api/gumroad-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId.trim() }),
      })
      const claimData = await claimRes.json()

      if (!claimData.success) {
        setMessage(claimData.error || 'Failed to claim token')
        setStep('error')
        return
      }

      setClaimResult(claimData)
      setMessage('Purchase verified! 🎉')
      setStep('success')

      // Store token in session/localStorage for use on other pages
      if (claimData.token) {
        localStorage.setItem('fatewise_token', claimData.token)
        sessionStorage.setItem('fatewise_token', claimData.token)
      }
    } catch (err) {
      console.error('[Verify] Error:', err)
      setMessage('An error occurred. Please try again or contact support.')
      setStep('error')
    }
  }

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-lg w-full page-enter">
        <div className="text-center mb-8">
          <span className="text-gold-primary text-sm uppercase tracking-wider">Purchase Verification</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-2 text-gold-glow">
            {step === 'success' ? '✨ Purchase Verified!' : 'Activate Your Destiny Book'}
          </h1>
          <p className="text-text-secondary text-sm">
            {step === 'success'
              ? 'Your payment is confirmed. Get your personalized reading now!'
              : 'Enter your Gumroad order ID to activate your purchase.'}
          </p>
        </div>

        {/* Success state */}
        {step === 'success' && claimResult.token ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-jade-green/10 border border-jade-green/30 rounded-full px-4 py-2">
                <span className="text-jade-green">✓</span>
                <span className="text-jade-green text-sm font-semibold">
                  {claimResult.plan === 'premium' ? 'Premium' : 'Pro'} Plan Active
                </span>
              </div>
              {claimResult.expiresAt && (
                <p className="text-text-tertiary text-xs">
                  Valid until {new Date(claimResult.expiresAt).toLocaleDateString()}
                </p>
              )}
              {!claimResult.expiresAt && (
                <p className="text-text-tertiary text-xs">Lifetime access</p>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <p className="text-text-tertiary text-xs">Your token</p>
              <p className="font-mono text-sm text-gold-primary break-all">{claimResult.token}</p>
              <p className="text-text-tertiary text-xs">
                Keep this token safe. You&apos;ll need it to access your Destiny Book.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/fatebook"
                className="btn-primary w-full text-center py-3 block"
              >
                📖 Open Your Destiny Book
              </Link>
              <Link
                href="/account"
                className="block text-center text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                View in Account →
              </Link>
            </div>
          </div>
        ) : (
          /* Input state */
          <div className="space-y-6">
            <div>
              <label htmlFor="order-id" className="block text-text-secondary text-sm mb-2">
                Gumroad Order ID
              </label>
              <input
                id="order-id"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 12345-67890-ABCDEF"
                disabled={step === 'verifying'}
                className="w-full glass-input px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-gold-primary/50 text-text-primary placeholder-text-tertiary outline-none transition-all"
              />
              <p className="text-text-tertiary text-xs mt-2">
                Found in your Gumroad receipt email (sent to the email you used at checkout).
              </p>
            </div>

            {step === 'error' && message && (
              <div className="p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20">
                <p className="text-cinnabar-red text-sm">{message}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={step === 'verifying'}
              className="btn-primary w-full text-center py-3"
            >
              {step === 'verifying' ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                '✓ Verify Purchase'
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-text-tertiary text-xs">
                Didn&apos;t receive a receipt? Check your spam folder, or{' '}
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary hover:underline">
                  contact support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <Link href="/payment" className="text-text-tertiary hover:text-text-primary transition-colors text-xs">
            ← Back to Plans
          </Link>
        </div>
      </div>
    </div>
  )
}
