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

    // Update the request status to COMPLETED
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'COMPLETED' })
      .eq('id', requestId)
      .eq('tracking_token', trackingToken) // extra security

    if (error) throw error

    // Redirect back to the tracking page
    return NextResponse.redirect(
      new URL(`/track/${trackingToken}`, request.url)
    )
  } catch (error: any) {
    console.error('Complete request error:', error)
    return NextResponse.json(
      { error: 'Failed to mark request as completed' },
      { status: 500 }
    )
  }
}
