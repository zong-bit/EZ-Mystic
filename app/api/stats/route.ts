import { NextResponse } from 'next/server'
import { getUsageStats } from '@/lib/usage-tracker'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // cache for 60 seconds

// Public stats endpoint — returns chart generation counts only (no unique IP data for privacy)
export async function GET() {
  try {
    const stats = await getUsageStats('fatewise')
    // Return only non-sensitive fields: today and total chart counts
    return NextResponse.json({
      today: stats.today,
      total: stats.total,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ today: 0, total: 0 })
  }
}
