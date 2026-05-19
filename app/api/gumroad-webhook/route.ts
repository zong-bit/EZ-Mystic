// app/api/gumroad-webhook/route.ts
// FateWise Gumroad purchase webhook handler
// Receives purchase callbacks from Gumroad, verifies signature, stores in DB,
// and creates an activation token for the buyer.

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createFatewiseToken, FATEWISE_PLANS, FatewisePlanId } from '@/lib/fatewise-tokens'

const GUMROAD_WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET || ''

/**
 * Verify Gumroad Ping signature (HMAC-SHA256).
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  if (!GUMROAD_WEBHOOK_SECRET) {
    console.warn('[FateWise Webhook] GUMROAD_WEBHOOK_SECRET not set, skipping signature verification')
    return true
  }
  const expected = crypto
    .createHmac('sha256', GUMROAD_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

/**
 * Detect FateWise plan from Gumroad product name or permalink.
 */
function detectFatewisePlan(
  productName: string,
  permalink?: string,
  variant?: string,
): FatewisePlanId {
  const lower = [
    (productName || '').toLowerCase(),
    (permalink || '').toLowerCase(),
    (variant || '').toLowerCase(),
  ].join(' ')

  if (lower.includes('ultimate') || lower.includes('premium') || lower.includes('gebxj')) {
    return 'premium-lifetime'
  }
  // Default: pro-monthly (maps to lcrujk product)
  return 'pro-monthly'
}

/**
 * Check if a sale has already been processed (idempotency).
 */
async function isDuplicateSale(saleId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('gumroad_sales')
    .select('id')
    .eq('sale_id', saleId)
    .single()
  return !!data
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.clone().text()
    const signature = request.headers.get('x-gumroad-signature')

    if (!verifySignature(rawBody, signature)) {
      console.warn('[FateWise Webhook] Invalid signature — rejecting')
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    // Gumroad sends form-encoded with payload="json_string"
    // Or JSON directly depending on configuration
    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      // Try form-encoded: the body might be key=value with a JSON payload field
      const params = new URLSearchParams(rawBody)
      const payloadStr = params.get('payload')
      if (payloadStr) {
        payload = JSON.parse(payloadStr)
      } else {
        return NextResponse.json({ success: false, error: 'Invalid payload format' }, { status: 400 })
      }
    }

    // Gumroad webhook event types
    const eventName = payload.event_name || payload.event || ''

    // Handle refunds
    const isRefund =
      eventName === 'refund' ||
      payload.refunded === true ||
      payload.chargebacked === true ||
      eventName === 'dispute_won'

    if (isRefund) {
      const saleId = payload.sale_id || payload.id || payload.sale?.id
      if (saleId) {
        const supabase = getSupabaseAdmin()
        await supabase.from('gumroad_sales').update({ refunded: true }).eq('sale_id', saleId)
        console.log(`[FateWise Webhook] Sale ${saleId} refunded`)
      }
      return NextResponse.json({ success: true })
    }

    // Only process sale events
    if (!eventName.includes('sale') && eventName !== '') {
      return NextResponse.json({ received: true, info: `Ignored event: ${eventName}` })
    }

    // Extract sale info from Gumroad payload
    const sale = payload.sale || payload
    const saleId = String(sale.id || sale.sale_id || sale.identifier || `fw-${Date.now()}`)
    const email = sale.email || sale.payer_email || sale.customer_email || sale.purchase_email || ''
    const productName = sale.product_name || sale.product?.name || 'FateWise Destiny Book'
    const permalink = sale.permalink || sale.product?.permalink || ''
    const variant = sale.variation || sale.variant || sale.variants || ''
    const price = parseFloat(sale.price || sale.sale_price || '0')

    console.log(`[FateWise Webhook] Sale received:`, {
      saleId,
      email,
      productName,
      permalink,
      variant,
      price,
    })

    // Idempotency check
    const isDup = await isDuplicateSale(saleId)
    if (isDup) {
      console.log(`[FateWise Webhook] Sale ${saleId} already processed, skipping`)
      return NextResponse.json({ success: true })
    }

    // Detect plan
    const planId = detectFatewisePlan(productName, permalink, variant)
    const planDef = FATEWISE_PLANS[planId]

    // Create a FateWise activation token
    const tokenEntry = await createFatewiseToken(planId, email)
    console.log(`[FateWise Webhook] Token created: ${tokenEntry.token}`)

    // Record the sale in the database
    const supabase = getSupabaseAdmin()
    const insertResult = await supabase.from('gumroad_sales').insert({
      sale_id: saleId,
      email,
      product_name: productName,
      plan: planId,
      token: tokenEntry.token,
      price,
      paid_at: new Date().toISOString(),
      expires_at: tokenEntry.expiresAt || null,
      refunded: false,
    })

    if (insertResult.error) {
      console.error('[FateWise Webhook] Failed to record sale:', insertResult.error)
    }

    console.log(`[FateWise Webhook] ✅ Processed: ${email} -> ${tokenEntry.token} (${planId})`)

    return NextResponse.json({ success: true, token: tokenEntry.token })
  } catch (error) {
    console.error('[FateWise Webhook Error]', error)
    // Always return 200 to Gumroad to prevent retries
    return NextResponse.json({ success: true, error: 'Internal processing error (logged)' })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message:
      'FateWise Gumroad webhook endpoint. Configure at gumroad.com/developers/webhooks',
    configured: !!process.env.GUMROAD_WEBHOOK_SECRET,
  })
}
