import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const requestId = formData.get('requestId') as string
    const trackingToken = formData.get('trackingToken') as string

    if (!requestId || !trackingToken) {
      return NextResponse.json(
        { error: 'Missing requestId or trackingToken' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 1. Verify the request exists and matches the tracking token
    const { data: requestData, error: fetchError } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('tracking_token', trackingToken)
      .single()

    if (fetchError || !requestData) {
      return NextResponse.json(
        { error: 'Invalid tracking token or request' },
        { status: 403 }
      )
    }

    // 2. Check that the status is AWARDED
    if (requestData.status !== 'AWARDED') {
      return NextResponse.json(
        { error: 'Request is not in AWARDED status' },
        { status: 400 }
      )
    }

    // 3. Update to COMPLETED
    const { error: updateError } = await supabase
      .from('service_requests')
      .update({ status: 'COMPLETED' })
      .eq('id', requestId)

    if (updateError) throw updateError

    // 4. Return success (client will handle redirect)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Complete request error:', error)
    return NextResponse.json(
      { error: 'Failed to mark request as completed' },
      { status: 500 }
    )
  }
}
