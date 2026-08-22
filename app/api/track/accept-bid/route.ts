import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Parse form data
    const formData = await request.formData()
    const bidId = formData.get('bidId') as string
    const requestId = formData.get('requestId') as string
    const trackingToken = formData.get('trackingToken') as string

    console.log('🔍 Accept bid called with:', { bidId, requestId, trackingToken })

    if (!bidId || !requestId || !trackingToken) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 2. Verify the request and token
    console.log('🔍 Verifying request and tracking token...')
    const { data: requestData, error: requestError } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('tracking_token', trackingToken)
      .single()

    if (requestError || !requestData) {
      console.log('❌ Invalid tracking token or request:', requestError)
      return NextResponse.json(
        { error: 'Invalid tracking token or request' },
        { status: 403 }
      )
    }
    console.log('✅ Request verified:', requestData)

    // 3. Verify the bid
    console.log('🔍 Verifying bid...')
    const { data: bidData, error: bidError } = await supabase
      .from('bids')
      .select('id, status')
      .eq('id', bidId)
      .eq('request_id', requestId)
      .single()

    if (bidError || !bidData) {
      console.log('❌ Bid not found:', bidError)
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      )
    }
    console.log('✅ Bid verified:', bidData)

    if (bidData.status !== 'PENDING') {
      console.log('❌ Bid is no longer pending (status: ' + bidData.status + ')')
      return NextResponse.json(
        { error: 'Bid is no longer pending' },
        { status: 400 }
      )
    }

    // 4. Accept the bid
    console.log('🔍 Updating bid status to ACCEPTED...')
    const { error: updateBidError } = await supabase
      .from('bids')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId)

    if (updateBidError) {
      console.log('❌ Failed to update bid:', updateBidError)
      throw updateBidError
    }
    console.log('✅ Bid updated to ACCEPTED')

    // 5. Update request status to AWARDED
    console.log('🔍 Updating request status to AWARDED...')
    const { error: updateRequestError } = await supabase
      .from('service_requests')
      .update({ status: 'AWARDED' })
      .eq('id', requestId)

    if (updateRequestError) {
      console.log('❌ Failed to update request:', updateRequestError)
      throw updateRequestError
    }
    console.log('✅ Request updated to AWARDED')

    // 6. Reject all other bids for this request
    console.log('🔍 Rejecting other bids...')
    const { error: rejectError } = await supabase
      .from('bids')
      .update({ status: 'REJECTED' })
      .eq('request_id', requestId)
      .neq('id', bidId)

    if (rejectError) {
      console.log('❌ Failed to reject other bids:', rejectError)
      // Not critical, we continue
    } else {
      console.log('✅ Other bids rejected')
    }

    console.log('🎉 Accept bid completed successfully')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Accept bid error:', error)
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    )
  }
}
