import { NextResponse } from 'next/server'
import { getUsageStats } from '@/lib/usage-tracker'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // cache for 60 seconds

export async function GET() {
  try {
    const stats = await getUsageStats('fatewise')
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { today: 0, total: 0, uniqueIps: 0 },
      { status: 200 }
    )
  }
}
