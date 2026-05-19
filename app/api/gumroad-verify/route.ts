// app/api/gumroad-verify/route.ts
// FateWise — Verify if a token or order ID is valid.
// Used by the fatebook page and payment/verify page to check access.

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { findFatewiseToken } from '@/lib/fatewise-tokens'

interface GumroadSale {
  id: number
  sale_id: string
  email: string
  product_name: string
  plan: string
  token: string
  price: number
  paid_at: string
  expires_at: string | null
  refunded: boolean
  created_at: string
}

async function getGumroadSale(saleId: string): Promise<GumroadSale | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('gumroad_sales')
    .select('*')
    .eq('sale_id', saleId)
    .maybeSingle()
  if (!data) return null
  return data as unknown as GumroadSale
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('order_id')
  const tokenStr = searchParams.get('token')

  // If token is provided, verify it directly
  if (tokenStr) {
    const tokenEntry = await findFatewiseToken(tokenStr)
    if (!tokenEntry) {
      return NextResponse.json(
        { valid: false, error: 'Token not found' },
        { status: 404 },
      )
    }

    if (tokenEntry.expiresAt && new Date(tokenEntry.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Token has expired' },
        { status: 403 },
      )
    }

    return NextResponse.json({
      valid: true,
      token: tokenEntry.token,
      plan: tokenEntry.plan,
      expiresAt: tokenEntry.expiresAt || null,
      maxRequests: tokenEntry.maxRequests,
    })
  }

  // If order_id is provided, look up the sale and its token
  if (orderId) {
    if (orderId.length < 6) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a valid order ID' },
        { status: 400 },
      )
    }

    const sale = await getGumroadSale(orderId)

    if (!sale) {
      return NextResponse.json(
        {
          valid: false,
          error:
            'Order not found. It may take a few minutes for the payment to sync. If the issue persists, contact selina_zxw@qq.com',
        },
        { status: 404 },
      )
    }

    if (sale.refunded) {
      return NextResponse.json(
        { valid: false, error: 'This order has been refunded.' },
        { status: 403 },
      )
    }

    const tokenEntry = await findFatewiseToken(sale.token)
    if (!tokenEntry) {
      return NextResponse.json(
        { valid: false, error: 'Token not found. Please contact support.' },
        { status: 404 },
      )
    }

    if (sale.expires_at && new Date(sale.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This token has expired.' },
        { status: 403 },
      )
    }

    return NextResponse.json({
      valid: true,
      token: sale.token,
      plan: sale.plan === 'premium-lifetime' ? 'premium' : 'pro',
      expiresAt: sale.expires_at,
      maxRequests: tokenEntry.maxRequests,
      productName: sale.product_name,
    })
  }

  return NextResponse.json(
    { valid: false, error: 'Provide either token or order_id parameter' },
    { status: 400 },
  )
}
