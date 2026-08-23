'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock } from 'lucide-react'
import BidForm from './BidForm'
import Chat from '@/components/Chat'

export default function InboxDetail({ params }: { params: { requestId: string } }) {
  const { requestId } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [request, setRequest] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [existingBid, setExistingBid] = useState<any>(null)
  const [allBids, setAllBids] = useState<any[]>([])
  const [providerId, setProviderId] = useState<string | null>(null)
  const [chatProps, setChatProps] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const userId = session.user.id
        setProviderId(userId)

        const { data: invitationData, error: invError } = await supabase
          .from('invitations')
          .select(`
            id,
            status,
            created_at,
            updated_at,
            request:service_requests (
              id,
              title,
              description,
              location,
              division,
              parish,
              timeline,
              budget_range,
              status,
              created_at,
              client:clients (
                id,
                name,
                phone,
                is_premium
              )
            )
          `)
          .eq('provider_id', userId)
          .eq('request_id', requestId)
          .single()

        if (invError || !invitationData) {
          setError('Invitation not found')
          setLoading(false)
          return
        }

        setInvitation(invitationData)
        const req = invitationData.request as any
        setRequest(req)
        setClient(req?.client || null)

        const { data: provider } = await supabase
          .from('service_providers')
          .select('is_premium')
          .eq('id', userId)
          .single()

        setIsPremium(provider?.is_premium || false)

        const { data: bid } = await supabase
          .from('bids')
          .select('*')
          .eq('request_id', requestId)
          .eq('provider_id', userId)
          .single()

        setExistingBid(bid)

        if (invitationData.status === 'PENDING') {
          await supabase
            .from('invitations')
            .update({ status: 'VIEWED' })
            .eq('id', invitationData.id)
        }

        const { data: allBidsData } = await supabase
          .from('bids')
          .select('*, provider:service_providers(business_name, is_premium, phone)')
          .eq('request_id', requestId)
          .order('created_at', { ascending: false })

        setAllBids(allBidsData || [])

        // Set up chat props if the request is awarded or completed
        if (req.status === 'AWARDED' || req.status === 'COMPLETED') {
          const acceptedBid = allBidsData?.find(b => b.status === 'ACCEPTED')
          if (acceptedBid && acceptedBid.provider) {
            const providerInfo = acceptedBid.provider
            setChatProps({
              requestId: requestId,
              currentUserId: userId,
              recipientId: req.client?.id || '',
              recipientName: req.client?.name || 'Client',
            })
          }
        }

      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [requestId, router])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error || !request) {
    return <div className="text-center py-8 text-red-600">{error || 'Request not found'}</div>
  }

  // Determine if we should show the client's phone
  const showClientPhone = isPremium || request.status === 'AWARDED' || request.status === 'COMPLETED'

  return (
    <div>
      <button
        onClick={() => router.push('/portal')}
        className="inline-flex items-center text-primary-blue hover:underline mb-4 cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{request.title}</CardTitle>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{request.location}</span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{request.timeline || 'No timeline'}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Badge className={`${
              request.status === 'INVITED' ? 'bg-blue-500' :
              request.status === 'BIDS_RECEIVED' ? 'bg-yellow-500' :
              request.status === 'AWARDED' ? 'bg-green-500' :
              'bg-gray-500'
            }`}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="text-gray-800">{request.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Client</span>
                <p className="font-medium">{client?.name || 'Anonymous'}</p>
              </div>
              {showClientPhone && client?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                  <p className="font-medium text-primary-blue">{client.phone}</p>
                </div>
              )}
              {!showClientPhone && client?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                  <p className="text-gray-400 text-sm">
                    {request.status === 'AWARDED' || request.status === 'COMPLETED' ? 'Contact info available after job is awarded' : '🔒 Upgrade to Premium to see contact details'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Bids ({allBids.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allBids.length === 0 ? (
            <p className="text-gray-500">No bids yet. Be the first to submit!</p>
          ) : (
            <div className="space-y-4">
              {allBids.map((bid) => {
                const providerInfo = bid.provider as any
                const isOwn = bid.provider_id === providerId
                return (
                  <div key={bid.id} className={`border rounded-lg p-4 ${isOwn ? 'bg-primary-blue/5 border-primary-blue' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {isOwn ? 'You' : providerInfo?.business_name || 'Unknown Provider'}
                          {isOwn && <span className="text-xs ml-2 bg-primary-blue text-white px-2 py-0.5 rounded-full">Your Bid</span>}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">UGX {bid.price?.toLocaleString()}</span>
                          {' • '}
                          <span>{bid.timeline}</span>
                        </div>
                        {bid.message && <p className="text-sm text-gray-700 mt-1">{bid.message}</p>}
                        <div className="mt-1">
                          <Badge className={`${
                            bid.status === 'ACCEPTED' ? 'bg-green-500' :
                            bid.status === 'REJECTED' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            {bid.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {(!existingBid || existingBid.status === 'REJECTED' || existingBid.status === 'WITHDRAWN') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Your Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <BidForm requestId={requestId} existingBid={existingBid} />
          </CardContent>
        </Card>
      )}

      {existingBid && existingBid.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><span className="font-medium">Price:</span> UGX {existingBid.price?.toLocaleString()}</div>
              <div><span className="font-medium">Timeline:</span> {existingBid.timeline}</div>
              {existingBid.message && <div><span className="font-medium">Message:</span> {existingBid.message}</div>}
              <Badge className="bg-yellow-500">Pending review</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      {chatProps && (
        <div className="mt-8">
          <Chat {...chatProps} />
        </div>
      )}
    </div>
  )
}
