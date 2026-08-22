import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const bidId = formData.get('bidId') as string
    const requestId = formData.get('requestId') as string
    const trackingToken = formData.get('trackingToken') as string

    if (!bidId || !requestId || !trackingToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Verify the request and token
    const { data: requestData, error: requestError } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('tracking_token', trackingToken)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { error: 'Invalid tracking token or request' },
        { status: 403 }
      )
    }

    // Verify the bid
    const { data: bidData, error: bidError } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('request_id', requestId)
      .single()

    if (bidError || !bidData) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      )
    }

    if (bidData.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bid is no longer pending' },
        { status: 400 }
      )
    }

    // Accept the bid
    const { error: updateBidError } = await supabase
      .from('bids')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId)

    if (updateBidError) throw updateBidError

    // Update request status
    const { error: updateRequestError } = await supabase
      .from('service_requests')
      .update({ status: 'AWARDED' })
      .eq('id', requestId)

    if (updateRequestError) throw updateRequestError

    // Reject other bids
    const { error: rejectError } = await supabase
      .from('bids')
      .update({ status: 'REJECTED' })
      .eq('request_id', requestId)
      .neq('id', bidId)

    if (rejectError) throw rejectError

    return NextResponse.redirect(
      new URL(`/track/${trackingToken}`, request.url)
    )
  } catch (error: any) {
    console.error('Accept bid error:', error)
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    )
  }
}
