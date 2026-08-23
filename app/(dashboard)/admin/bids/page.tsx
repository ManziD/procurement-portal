'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, DollarSign, Clock } from 'lucide-react'

interface Bid {
  id: string
  price: number
  timeline: string
  status: string
  created_at: string
  provider: {
    business_name: string
  }
  request: {
    title: string
  }
}

export default function AdminBids() {
  const [loading, setLoading] = useState(true)
  const [bids, setBids] = useState<Bid[]>([])

  const loadBids = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bids')
      .select('*, provider:service_providers(business_name), request:service_requests(title)')
      .order('created_at', { ascending: false })
    setBids(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadBids()
  }, [])

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'bg-yellow-500',
      'ACCEPTED': 'bg-green-500',
      'REJECTED': 'bg-red-500',
      'WITHDRAWN': 'bg-gray-400',
    }
    return map[status] || 'bg-gray-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <div className="text-center py-8">Loading bids...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Bids</h1>
        <Button onClick={loadBids} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No bids found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{bid.request?.title || 'Unknown Request'}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> {formatCurrency(bid.price)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {bid.timeline}
                    </div>
                    <div className="text-sm text-gray-500">Provider: {bid.provider?.business_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">Submitted: {new Date(bid.created_at).toLocaleDateString()}</div>
                  </div>
                  <Badge className={getStatusBadge(bid.status)}>{bid.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
