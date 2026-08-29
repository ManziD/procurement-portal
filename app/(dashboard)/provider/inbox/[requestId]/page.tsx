'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Clock, ArrowLeft, Loader2 } from 'lucide-react'
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
  const [showChat, setShowChat] = useState(false)

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
              profile_id,
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

        if ((req.status === 'AWARDED' || req.status === 'COMPLETED') && req.profile_id) {
          const acceptedBid = allBidsData?.find(b => b.status === 'ACCEPTED')
          if (acceptedBid && acceptedBid.provider) {
            const providerInfo = acceptedBid.provider
            setChatProps({
              requestId: requestId,
              currentUserId: userId,
              recipientId: req.profile_id,
              recipientName: req.client?.name || 'Client',
            })
            setShowChat(true)
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

  const showClientPhone = isPremium || request.status === 'AWARDED' || request.status === 'COMPLETED'
  const canSubmitBid = !existingBid || existingBid.status === 'REJECTED' || existingBid.status === 'WITHDRAWN'
  const hasPendingBid = existingBid && existingBid.status === 'PENDING'

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm flex-shrink-0">
        <button
          onClick={() => router.push('/provider/inbox')}
          className="flex items-center text-primary-blue hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">
            {showChat ? chatProps?.recipientName || 'Conversation' : request.title}
          </span>
          {request.status && (
            <Badge className={
              request.status === 'AWARDED' ? 'bg-green-600' :
              request.status === 'COMPLETED' ? 'bg-gray-500' :
              request.status === 'INVITED' ? 'bg-blue-500' :
              'bg-yellow-500'
            }>
              {request.status}
            </Badge>
          )}
        </div>
        <div className="w-16"></div> {/* spacer */}
      </div>

      {/* Main content – fills remaining height */}
      <div className="flex-1 overflow-hidden">
        {showChat && chatProps ? (
          <Chat {...chatProps} isFullHeight />
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Request details (collapsed info) */}
            <div className="bg-white rounded-lg border p-3 text-sm">
              <p className="font-medium">{request.title}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-gray-600">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{request.location}</span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{request.timeline || 'No timeline'}</span>
              </div>
              {request.client_phone && showClientPhone && (
                <div className="text-gray-500 mt-1">📞 Client: {request.client_phone}</div>
              )}
              {!showClientPhone && request.client_phone && (
                <div className="text-gray-400 text-sm mt-1">🔒 Premium providers can see contact</div>
              )}
              {request.description && <p className="text-gray-700 mt-2">{request.description}</p>}
            </div>

            {/* Bids list */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bids ({allBids.length})</h3>
              {allBids.length === 0 ? (
                <p className="text-gray-500">No bids yet. Be the first to submit!</p>
              ) : (
                <div className="space-y-3">
                  {allBids.map((bid) => {
                    const isOwn = bid.provider_id === providerId
                    return (
                      <div key={bid.id} className={`border rounded-lg p-4 ${isOwn ? 'bg-primary-blue/5 border-primary-blue' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">
                              {isOwn ? 'You' : bid.provider?.business_name || 'Unknown Provider'}
                              {isOwn && <span className="text-xs ml-2 bg-primary-blue text-white px-2 py-0.5 rounded-full">Your Bid</span>}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">UGX {bid.price?.toLocaleString()}</span>
                              {' • '}
                              <span>{bid.timeline}</span>
                            </div>
                            {bid.message && <p className="text-sm text-gray-700 mt-1">{bid.message}</p>}
                            <Badge className={`mt-1 ${
                              bid.status === 'ACCEPTED' ? 'bg-green-500' :
                              bid.status === 'REJECTED' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}>
                              {bid.status}
                            </Badge>
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
            </div>

            {/* Submit Bid form (if applicable) */}
            {canSubmitBid && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Submit Your Bid</h3>
                <BidForm requestId={requestId} existingBid={existingBid} />
              </div>
            )}

            {hasPendingBid && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Bid</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Price:</span> UGX {existingBid.price?.toLocaleString()}</div>
                  <div><span className="font-medium">Timeline:</span> {existingBid.timeline}</div>
                  {existingBid.message && <div><span className="font-medium">Message:</span> {existingBid.message}</div>}
                  <Badge className="bg-yellow-500">Pending review</Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
