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

    // 1. Update the bid status to ACCEPTED
    const { error: bidError } = await supabase
      .from('bids')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId)

    if (bidError) throw bidError

    // 2. Update the request status to AWARDED
    const { error: requestError } = await supabase
      .from('service_requests')
      .update({ status: 'AWARDED' })
      .eq('id', requestId)

    if (requestError) throw requestError

    // 3. Reject all other bids for this request
    const { error: rejectError } = await supabase
      .from('bids')
      .update({ status: 'REJECTED' })
      .eq('request_id', requestId)
      .neq('id', bidId)

    if (rejectError) throw rejectError

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
    console.error('Accept bid error:', error)
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    )
  }
}
