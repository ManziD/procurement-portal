'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'

interface Provider {
  id: string
  business_name: string
  phone: string | null
  services_offered: string[]
  serves_locations: string[]
  is_verified: boolean
  rating: number
  total_reviews: number
  created_at: string
}

export default function AdminProviders() {
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<Provider[]>([])
  const [verifying, setVerifying] = useState<string | null>(null)

  const loadProviders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('service_providers')
      .select('*')
      .order('created_at', { ascending: false })
    setProviders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProviders()
  }, [])

  const toggleVerification = async (providerId: string, currentStatus: boolean) => {
    setVerifying(providerId)
    const { error } = await supabase
      .from('service_providers')
      .update({ is_verified: !currentStatus })
      .eq('id', providerId)

    if (error) {
      console.error('Error updating verification:', error)
    } else {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId ? { ...p, is_verified: !currentStatus } : p
        )
      )
    }
    setVerifying(null)
  }

  if (loading) {
    return <div className="text-center py-8">Loading providers...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Providers</h1>
        <Button onClick={loadProviders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No providers found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{provider.business_name}</span>
                      {provider.is_verified ? (
                        <Badge className="bg-green-500">Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Pending</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>📞 {provider.phone || 'No phone'}</span>
                      <span className="mx-2">•</span>
                      <span>⭐ {provider.rating || 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span>{provider.total_reviews || 0} reviews</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Services: {provider.services_offered?.join(', ') || 'None'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Locations: {provider.serves_locations?.join(', ') || 'None'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined: {new Date(provider.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={provider.is_verified ? 'destructive' : 'default'}
                      onClick={() => toggleVerification(provider.id, provider.is_verified)}
                      disabled={verifying === provider.id}
                    >
                      {verifying === provider.id ? (
                        '...'
                      ) : provider.is_verified ? (
                        <><XCircle className="h-4 w-4 mr-1" /> Unverify</>
                      ) : (
                        <><CheckCircle className="h-4 w-4 mr-1" /> Verify</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
