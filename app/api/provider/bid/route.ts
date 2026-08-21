import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { requestId, price, timeline, message } = body

    // 3. Validate required fields
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid price (UGX)' },
        { status: 400 }
      )
    }

    if (!timeline || timeline.trim() === '') {
      return NextResponse.json(
        { error: 'Please enter a timeline' },
        { status: 400 }
      )
    }

    // 4. Check if provider is invited to this request
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('request_id', requestId)
      .eq('provider_id', user.id)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'You are not invited to this request' },
        { status: 403 }
      )
    }

    // 5. Check if bid already exists (prevent duplicates)
    const { data: existingBid } = await supabase
      .from('bids')
      .select('id')
      .eq('request_id', requestId)
      .eq('provider_id', user.id)
      .single()

    if (existingBid) {
      return NextResponse.json(
        { error: 'You have already submitted a bid for this request' },
        { status: 409 }
      )
    }

    // 6. Insert the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        request_id: requestId,
        provider_id: user.id,
        price: parseInt(price.toString()),
        timeline: timeline.trim(),
        message: message?.trim() || null,
        status: 'PENDING',
      })
      .select()
      .single()

    if (bidError) {
      console.error('Bid insert error:', bidError)
      return NextResponse.json(
        { error: 'Failed to submit bid. Please try again.' },
        { status: 500 }
      )
    }

    // 7. Update invitation status to BID_SUBMITTED
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'BID_SUBMITTED' })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Invitation update error:', updateError)
      // Non-critical – we can still return success
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      bid: bid,
      message: 'Bid submitted successfully!',
    })

  } catch (error: any) {
    console.error('Bid API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
