import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, Calendar, CheckCircle, Clock as ClockIcon, Loader2 } from 'lucide-react'

export default async function TrackTokenPage({ params }: { params: { token: string } }) {
  const { token } = params

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch the request using the token
  const { data: request, error: requestError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('tracking_token', token)
    .single()

  if (requestError || !request) {
    notFound()
  }

  // 2. Fetch bids for this request with provider info
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
        rating
      )
    `)
    .eq('request_id', request.id)
    .order('created_at', { ascending: false })

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

  // Status message helper
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

      {/* Request Details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary-blue">{request.title}</CardTitle>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{request.location}</span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{request.timeline || 'No timeline'}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{request.description || 'No description provided.'}</p>
          {request.client_phone && (
            <div className="mt-4 text-sm text-gray-500">
              📞 Phone: {request.client_phone}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bids */}
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
            const provider = bid.provider as any
            const isPending = bid.status === 'PENDING' && request.status === 'INVITED'
            const isAccepted = bid.status === 'ACCEPTED'
            return (
              <Card key={bid.id} className={isAccepted ? 'border-green-500 border-2' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{provider?.business_name || 'Anonymous Provider'}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{formatCurrency(bid.price)}</span>
                        {' • '}
                        <span>{bid.timeline}</span>
                      </div>
                      {bid.message && <p className="text-sm text-gray-700 mt-1">{bid.message}</p>}
                      <div className="mt-2">
                        <Badge className={getBidStatusBadge(bid.status)}>{bid.status}</Badge>
                      </div>
                    </div>
                    {isPending && !isCompleted && (
                      <div className="flex gap-2">
                        <form action="/api/track/accept-bid" method="POST">
                          <input type="hidden" name="bidId" value={bid.id} />
                          <input type="hidden" name="requestId" value={request.id} />
                          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            Accept
                          </Button>
                        </form>
                        <form action="/api/track/reject-bid" method="POST">
                          <input type="hidden" name="bidId" value={bid.id} />
                          <input type="hidden" name="requestId" value={request.id} />
                          <Button type="submit" variant="destructive">
                            Reject
                          </Button>
                        </form>
                      </div>
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

      {/* Mark as Completed Button */}
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

      {/* Call to action */}
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
