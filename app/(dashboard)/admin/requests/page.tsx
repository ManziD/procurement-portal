'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, MapPin, Calendar } from 'lucide-react'

interface Request {
  id: string
  title: string
  description: string
  location: string
  division: string
  parish: string
  status: string
  created_at: string
  client_phone: string
}

export default function AdminRequests() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])

  const loadRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'INVITED': 'bg-blue-500',
      'BIDS_RECEIVED': 'bg-purple-500',
      'AWARDED': 'bg-green-500',
      'COMPLETED': 'bg-gray-500',
      'CANCELLED': 'bg-red-500',
    }
    return map[status] || 'bg-yellow-500'
  }

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Service Requests</h1>
        <Button onClick={loadRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No requests found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{req.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {req.location}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                    {req.client_phone && (
                      <div className="text-sm text-gray-500">📞 {req.client_phone}</div>
                    )}
                    <div className="text-sm text-gray-700 mt-1 line-clamp-2">{req.description}</div>
                  </div>
                  <Badge className={getStatusBadge(req.status)}>{req.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
