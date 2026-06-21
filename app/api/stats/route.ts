import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // cache for 60 seconds

// Public stats endpoint — no sensitive data exposed (no unique IP counts)
export async function GET() {
  return NextResponse.json({
    message: 'FateWise usage stats are not publicly available.',
    // Remove this endpoint from public access — use internal monitoring instead
  })
}
