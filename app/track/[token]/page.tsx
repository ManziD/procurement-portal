import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, Calendar, CheckCircle, Clock as ClockIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Chat from '@/components/Chat'
import TrackActions from './TrackActions'
import { getCurrentUser } from '@/lib/supabase/client'

export default async function TrackTokenPage({ params }: { params: { token: string } }) {
  const { token } = params

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: request, error: requestError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('tracking_token', token)
    .single()

  if (requestError || !request) {
    notFound()
  }

  const { data: bids } = await supabase
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
    .eq('request_id', request.id)
    .order('created_at', { ascending: false })

  const user = await getCurrentUser()
  let chatProps = null
  let showChat = false

  // Check if user is logged in and request is awarded/completed
  if (user) {
    if (request.status === 'AWARDED' || request.status === 'COMPLETED') {
      const acceptedBid = bids?.find(b => b.status === 'ACCEPTED')
      if (acceptedBid && acceptedBid.provider) {
        const provider = acceptedBid.provider as any
        chatProps = {
          requestId: request.id,
          currentUserId: user.id,
          recipientId: provider.id,
          recipientName: provider.business_name || 'Provider',
        }
        showChat = true
      }
    }
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
        return { icon: <CheckCircle className="h-5 w-5" />, text: 'You have accepted a bid. The job is in progress.' }
      case 'COMPLETED':
        return { icon: <CheckCircle className="h-5 w-5" />, text: 'Job completed! Thank you for using ServiceHub-Ug.' }
      default:
        return { icon: <ClockIcon className="h-5 w-5" />, text: 'Status: ' + status }
    }
  }

  const statusInfo = getStatusMessage(request.status)
  const isCompleted = request.status === 'COMPLETED'
  const isAwarded = request.status === 'AWARDED'
  const canMarkComplete = isAwarded && !isCompleted

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back to Inbox button */}
      <Link href="/inbox" className="inline-flex items-center text-primary-blue hover:underline mb-4">
        ← Back to Inbox
      </Link>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
        request.status === 'COMPLETED' ? 'bg-green-50 border border-green-200' :
        request.status === 'AWARDED' ? 'bg-blue-50 border border-blue-200' :
        request.status === 'BIDS_RECEIVED' ? 'bg-purple-50 border border-purple-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="text-primary-blue">{statusInfo.icon}</div>
        <p className="text-gray-700">{statusInfo.text}</p>
        <Badge className={getStatusBadge(request.status)}>{request.status}</Badge>
      </div>

      {/* CHAT - PRIMARY VIEW when awarded/completed */}
      {showChat && chatProps && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">💬 Conversation</h2>
          <Chat {...chatProps} />
        </div>
      )}

      {/* Request Details - collapsed when chat is shown */}
      <details className={`mb-6 border rounded-lg p-4 ${showChat ? 'bg-gray-50' : ''}`}>
        <summary className="cursor-pointer font-medium text-gray-700 flex items-center gap-2">
          <span>📋 Request Details</span>
          <ChevronDown className="h-4 w-4" />
        </summary>
        <div className="mt-4 space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-primary-blue">{request.title}</h3>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{request.location}</span>
              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{request.timeline || 'No timeline'}</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-700">{request.description || 'No description provided.'}</p>
          {request.client_phone && (
            <div className="text-sm text-gray-500">📞 Phone: {request.client_phone}</div>
          )}
        </div>
      </details>

      {/* Bids section - hidden when chat is shown (since the job is awarded/completed) */}
      {!showChat && (
        <>
          <h2 className="text-xl font-semibold text-primary-blue mb-4">Bids ({bids?.length || 0})</h2>
          {!bids || bids.length === 0 ? (
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

      {/* Mark as Completed Button (only if awarded and not completed) */}
      {canMarkComplete && (
        <div className="mt-8 flex justify-center">
          <form action="/api/track/complete-request" method="POST">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="trackingToken" value={token} />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark as Completed
            </Button>
          </form>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need help? Contact us at <a href="mailto:info@servicehub-ug.com" className="text-primary-blue hover:underline">info@servicehub-ug.com</a></p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/" className="text-primary-blue hover:underline">Home</Link>
          <Link href="/browse" className="text-primary-blue hover:underline">Browse Services</Link>
        </div>
      </div>
    </div>
  )
}
