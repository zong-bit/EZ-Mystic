// app/api/gumroad-claim/route.ts
// FateWise — User enters their Gumroad order ID to activate their purchase.
// Validates the sale, links the token to their account, and returns activation info.

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  findFatewiseToken,
  linkFatewiseTokenToUser,
  createFatewiseSubscription,
} from '@/lib/fatewise-tokens'

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

async function getGumroadSaleByOrderId(
  orderId: string,
): Promise<GumroadSale | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('gumroad_sales')
    .select('*')
    .eq('sale_id', orderId)
    .maybeSingle()
  if (!data) return null
  return data as unknown as GumroadSale
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, email, user_id } = body

    if (!order_id || order_id.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Gumroad order ID' },
        { status: 400 },
      )
    }

    // Look up the sale by Gumroad order ID
    const sale = await getGumroadSaleByOrderId(order_id)

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Order not found. It may take a few minutes for the webhook to sync. If the issue persists, reach out to selina_zxw@qq.com',
        },
        { status: 404 },
      )
    }

    // Check if refunded
    if (sale.refunded) {
      return NextResponse.json(
        { success: false, error: 'This order has been refunded. The token has been revoked.' },
        { status: 403 },
      )
    }

    // Find the token
    const tokenEntry = await findFatewiseToken(sale.token)
    if (!tokenEntry) {
      return NextResponse.json(
        { success: false, error: 'Token not found. Please contact support.' },
        { status: 404 },
      )
    }

    // Check expiry
    if (tokenEntry.expiresAt && new Date(tokenEntry.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This token has expired.' },
        { status: 403 },
      )
    }

    // If user is logged in, link the token to their account
    if (user_id) {
      const linked = await linkFatewiseTokenToUser(sale.token, user_id)
      if (linked) {
        // Create/update subscription
        const planLabel = sale.plan === 'premium-lifetime' ? 'premium' : 'pro'
        await createFatewiseSubscription(user_id, planLabel, sale.sale_id, sale.expires_at || undefined)
      }
    }

    return NextResponse.json({
      success: true,
      token: sale.token,
      plan: sale.plan === 'premium-lifetime' ? 'premium' : 'pro',
      expiresAt: sale.expires_at || null,
      email: sale.email,
      productName: sale.product_name,
      message: '🎉 Purchase verified! Your Destiny Book is ready.',
    })
  } catch (error) {
    console.error('[FateWise Claim Error]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
