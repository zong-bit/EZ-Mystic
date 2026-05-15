// app/api/gumroad-webhook/route.ts
// Gumroad purchase webhook handler
// Verifies Gumroad sale signatures and records purchases
// When a user pays, they can visit /payment/verify?order_id=xxx to get their Destiny Book

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const GUMROAD_WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const rawBody = body;

    // Verify Gumroad webhook signature
    if (GUMROAD_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-gumroad-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      const hmac = crypto.createHmac('sha256', GUMROAD_WEBHOOK_SECRET);
      const digest = hmac.update(rawBody).digest('hex');

      if (digest !== signature) {
        console.error('Gumroad webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(rawBody);

    // Gumroad sends 'sale' event with purchase info
    if (data.event_name === 'create_sale' || data.event_name === 'recurring_sale') {
      const {
        product_name,
        variation,
        price_cents,
        customer_email,
        purchase_email,
        license_key,
        identifier,
        gumroad_product_id,
      } = data;

      console.log('Gumroad sale received:', {
        product_name,
        variation,
        price_cents,
        customer_email,
        gumroad_product_id,
      });

      // Record the purchase (in production, store in database)
      // For MVP, we just acknowledge the webhook
      // The customer can visit /payment/verify?email=xxx to get their Destiny Book

      // Send confirmation email (in production, use SendGrid/Mailgun)
      // For now, Gumroad handles email delivery automatically

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: false, reason: 'Unknown event' });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gumroad webhook endpoint. Configure your webhook URL at gumroad.com/developers/webhooks',
    configured_secret: !!process.env.GUMROAD_WEBHOOK_SECRET,
  });
}
