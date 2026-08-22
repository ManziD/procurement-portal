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

    // 1. Verify the tracking token (this is the security check)
    const { data: requestData, error: requestError } = await supabase
      .from('service_requests')
      .select('id')
      .eq('id', requestId)
      .eq('tracking_token', trackingToken)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { error: 'Invalid tracking token or request' },
        { status: 403 }
      )
    }

    // 2. Call the PostgreSQL function (bypasses RLS)
    const { data: result, error: functionError } = await supabase.rpc('accept_bid', {
      bid_id: bidId,
      request_id: requestId,
    })

    if (functionError) {
      console.error('Function error:', functionError)
      return NextResponse.json(
        { error: 'Failed to accept bid' },
        { status: 500 }
      )
    }

    if (result && result.success === false) {
      return NextResponse.json(
        { error: result.error || 'Failed to accept bid' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Accept bid error:', error)
    return NextResponse.json(
      { error: 'Failed to accept bid' },
      { status: 500 }
    )
  }
}
