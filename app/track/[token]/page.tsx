'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Calendar, CheckCircle, Clock as ClockIcon, Loader2, ChevronDown, ArrowLeft } from 'lucide-react'
import Chat from '@/components/Chat'
import TrackActions from './TrackActions'

export default function TrackTokenPage({ params }: { params: { token: string } }) {
  const { token } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [chatProps, setChatProps] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)

        const { data: requestData, error: requestError } = await supabase
          .from('service_requests')
          .select('*')
          .eq('tracking_token', token)
          .single()

        if (requestError || !requestData) {
          setError('Request not found')
          setLoading(false)
          return
        }
        setRequest(requestData)

        const { data: bidsData } = await supabase
          .from('bids')
          .select(`
            id,
            price,
            timeline,
            message,
            status,
            created_at,
            provider:service_providers (
              id,
              business_name,
              rating,
              phone
            )
          `)
          .eq('request_id', requestData.id)
          .order('created_at', { ascending: false })

        setBids(bidsData || [])

        const currentUser = session?.user
        if (currentUser) {
          const isAwardedOrCompleted = requestData.status === 'AWARDED' || requestData.status === 'COMPLETED'
          if (isAwardedOrCompleted) {
            const acceptedBid = bidsData?.find(b => b.status === 'ACCEPTED')
            if (acceptedBid && acceptedBid.provider) {
              const provider = acceptedBid.provider as any
              setChatProps({
                requestId: requestData.id,
                currentUserId: currentUser.id,
                recipientId: provider.id,
                recipientName: provider.business_name || 'Provider',
              })
              setShowChat(true)
            }
          }
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const handleComplete = async () => {
    setCompleting(true)
    setCompleteError(null)

    try {
      const res = await fetch('/api/track/complete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          requestId: request.id,
          trackingToken: token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to mark as completed')
      }

      router.refresh()
    } catch (err: any) {
      setCompleteError(err.message)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error || !request) {
    return <div className="text-center py-8 text-red-600">{error || 'Request not found'}</div>
  }

  const showProviderPhone = request.status === 'AWARDED' || request.status === 'COMPLETED'
  const acceptedBid = bids?.find(b => b.status === 'ACCEPTED')
  const provider = acceptedBid?.provider as any

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'bg-yellow-500',
      'INVITED': 'bg-blue-500',
      'BIDS_RECEIVED': 'bg-purple-500',
      'AWARDED': 'bg-green-600',
      'COMPLETED': 'bg-gray-500',
      'CANCELLED': 'bg-red-500',
    }
    return map[status] || 'bg-gray-500'
  }

  const getBidStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'bg-yellow-500',
      'ACCEPTED': 'bg-green-600',
      'REJECTED': 'bg-red-500',
      'WITHDRAWN': 'bg-gray-400',
    }
    return map[status] || 'bg-gray-500'
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'INVITED':
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Waiting for providers to submit bids...' }
      case 'BIDS_RECEIVED':
        return { icon: <ClockIcon className="h-5 w-5" />, text: 'Bids received! Review them below.' }
      case 'AWARDED':
        return { icon: <CheckCircle className="h-5 w-5" />, text: '' }
      case 'COMPLETED':
        return { icon: <CheckCircle className="h-5 w-5" />, text: '' }
      default:
        return { icon: <ClockIcon className="h-5 w-5" />, text: 'Status: ' + status }
    }
  }

  const statusInfo = getStatusMessage(request.status)
  const isCompleted = request.status === 'COMPLETED'
  const isAwarded = request.status === 'AWARDED'
  const canMarkComplete = isAwarded && !isCompleted
  const showStatusBanner = request.status !== 'AWARDED' && request.status !== 'COMPLETED'

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm flex-shrink-0">
        <button
          onClick={() => router.push('/inbox')}
          className="flex items-center text-primary-blue hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">
            {chatProps?.recipientName || 'Conversation'}
          </span>
          {request.status && (
            <Badge className={getStatusBadge(request.status)}>{request.status}</Badge>
          )}
        </div>
        <div className="w-16"></div> {/* spacer */}
      </div>

      {/* Chat area - fills remaining height */}
      <div className="flex-1 overflow-hidden">
        {showChat && chatProps ? (
          <Chat {...chatProps} isFullHeight />
        ) : (
          <div className="p-4 h-full overflow-y-auto">
            {/* If chat isn't shown, show the details */}
            {!showChat && (
              <>
                <h2 className="text-xl font-semibold text-primary-blue mb-4">Bids ({bids.length})</h2>
                {bids.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-gray-500">
                      No bids submitted yet. Check back later.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => {
                      const providerData = bid.provider as any
                      const isPending = bid.status === 'PENDING' && request.status === 'INVITED'
                      const isAccepted = bid.status === 'ACCEPTED'
                      return (
                        <Card key={bid.id} className={isAccepted ? 'border-green-500 border-2' : ''}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">{providerData?.business_name || 'Anonymous Provider'}</div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">{formatCurrency(bid.price)}</span>
                                  {' • '}
                                  <span>{bid.timeline}</span>
                                </div>
                                {bid.message && <p className="text-sm text-gray-700 mt-1">{bid.message}</p>}
                                {showProviderPhone && providerData?.phone && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    📞 Provider phone: {providerData.phone}
                                  </div>
                                )}
                                <div className="mt-2">
                                  <Badge className={getBidStatusBadge(bid.status)}>{bid.status}</Badge>
                                </div>
                              </div>
                              {isPending && !isCompleted && (
                                <TrackActions
                                  bidId={bid.id}
                                  requestId={request.id}
                                  trackingToken={token}
                                />
                              )}
                              {isAccepted && (
                                <Badge className="bg-green-600">Accepted</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mark as Completed button (if applicable) */}
      {canMarkComplete && (
        <div className="flex-shrink-0 p-4 bg-white border-t">
          <Button
            onClick={handleComplete}
            disabled={completing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {completing ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Completing...</>
            ) : (
              <><CheckCircle className="h-5 w-5 mr-2" /> Mark as Completed</>
            )}
          </Button>
          {completeError && <p className="text-red-600 text-sm mt-2 text-center">{completeError}</p>}
        </div>
      )}
    </div>
  )
}
