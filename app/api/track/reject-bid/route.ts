import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const bidId = formData.get('bidId') as string
    const requestId = formData.get('requestId') as string

    if (!bidId || !requestId) {
      return NextResponse.json(
        { error: 'Missing bidId or requestId' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 1. Update the bid status to REJECTED
    const { error: bidError } = await supabase
      .from('bids')
      .update({ status: 'REJECTED' })
      .eq('id', bidId)

    if (bidError) throw bidError

    // Redirect back to the tracking page
    const { data: requestData } = await supabase
      .from('service_requests')
      .select('tracking_token')
      .eq('id', requestId)
      .single()

    return NextResponse.redirect(
      new URL(`/track/${requestData?.tracking_token}`, request.url)
    )
  } catch (error: any) {
    console.error('Reject bid error:', error)
    return NextResponse.json(
      { error: 'Failed to reject bid' },
      { status: 500 }
    )
  }
}
