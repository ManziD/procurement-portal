import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]

    // 2. Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // 3. Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Parse request body
    const body = await request.json()
    const { requestId, price, timeline, message } = body

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

    // 5. Check invitation
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

    // 6. Check duplicate bid
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

    // 7. Insert bid
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

    // 8. Update invitation status
    await supabase
      .from('invitations')
      .update({ status: 'BID_SUBMITTED' })
      .eq('id', invitation.id)

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
