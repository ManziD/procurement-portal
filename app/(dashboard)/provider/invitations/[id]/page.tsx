import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase as clientSupabase } from '@/lib/supabase/client'

export default async function InvitationDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get invitation and request details
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*, request:service_requests(*)')
    .eq('provider_id', user.id)
    .eq('request_id', params.id)
    .single()

  if (invError || !invitation) notFound()

  const request = invitation.request as any

  // Get provider details to check premium
  const { data: provider } = await supabase
    .from('service_providers')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const isPremium = provider?.is_premium || false

  // Check if bid already exists
  const { data: existingBid } = await supabase
    .from('bids')
    .select('*')
    .eq('request_id', params.id)
    .eq('provider_id', user.id)
    .single()

  const hasBid = !!existingBid

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/provider/invitations">
          <Button variant="outline">← Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-primary-blue">Invitation Detail</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Title</span>
              <p className="font-medium">{request.title}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Description</span>
              <p>{request.description || 'No description provided.'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p>{request.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Timeline</span>
              <p>{request.timeline || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <Badge>{request.status}</Badge>
            </div>
            {isPremium && (
              <div>
                <span className="text-sm text-gray-500">Client Phone</span>
                <p className="font-mono">(Visible to premium providers only)</p>
                {/* Here we would show the client's phone, but we need to fetch from clients table */}
                {/* For now, placeholder */}
              </div>
            )}
            {!isPremium && (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-700">
                🔒 Upgrade to Premium to see client contact details.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid Form */}
        <Card>
          <CardHeader>
            <CardTitle>{hasBid ? 'Your Bid' : 'Submit a Bid'}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasBid ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Quote</span>
                  <p className="font-medium">UGX {existingBid.price?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Timeline</span>
                  <p>{existingBid.timeline}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Message</span>
                  <p>{existingBid.message}</p>
                </div>
                <Badge className="bg-green-500">Submitted</Badge>
              </div>
            ) : (
              <form action={`/api/provider/bid`} method="POST" className="space-y-4">
                <input type="hidden" name="requestId" value={params.id} />
                <div>
                  <label className="block text-sm font-medium mb-1">Quote (UGX)</label>
                  <Input name="price" type="number" placeholder="e.g., 150000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timeline</label>
                  <Input name="timeline" placeholder="e.g., 2 hours, Tomorrow morning" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message to client</label>
                  <Textarea name="message" rows={3} placeholder="Explain why you're the best choice..." />
                </div>
                <Button type="submit" className="w-full bg-accent-orange hover:bg-opacity-90">
                  Submit Bid
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
