'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TrackLookupPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    const { data, error } = await supabase
      .from('service_requests')
      .select('id, title, location, status, created_at, tracking_token')
      .eq('client_phone', phone)
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to fetch your requests. Please try again.')
      setLoading(false)
      return
    }

    setRequests(data || [])
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary-blue">Track Your Requests</CardTitle>
          <p className="text-gray-600 text-sm">
            Enter the phone number you used when posting your request.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="e.g., 0750123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue hover:bg-primary-dark"
            >
              {loading ? 'Searching...' : 'Find My Requests'}
            </Button>
          </form>

          {searched && !loading && (
            <div className="mt-6">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No requests found for this phone number.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Found {requests.length} request{requests.length > 1 ? 's' : ''}:
                  </p>
                  {requests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/track/${req.tracking_token}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{req.title}</div>
                            <div className="text-sm text-gray-600">{req.location}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(req.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={req.status === 'OPEN' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-primary-blue mt-2 hover:underline">
                          View details →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
