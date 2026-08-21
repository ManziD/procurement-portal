import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function ProviderInbox() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: invitations, error } = await supabase
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
    .eq('provider_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching inbox:', error)
  }

  const { data: provider } = await supabase
    .from('service_providers')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const isPremium = provider?.is_premium || false

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, className: string }> = {
      'PENDING': { label: 'New', className: 'bg-yellow-500' },
      'VIEWED': { label: 'Viewed', className: 'bg-blue-500' },
      'BID_SUBMITTED': { label: 'Bid Sent', className: 'bg-green-500' },
      'DECLINED': { label: 'Declined', className: 'bg-gray-500' },
    }
    return map[status] || { label: status, className: 'bg-gray-500' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'BID_SUBMITTED': return <CheckCircle className="h-4 w-4" />
      case 'DECLINED': return <XCircle className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Inbox</h1>
        <div className="text-sm text-gray-500">
          {invitations?.length || 0} conversations
        </div>
      </div>

      {!invitations || invitations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-700">No conversations yet</h2>
            <p className="text-gray-500 mt-2">
              When clients invite you to their requests, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const request = inv.request as any
            const client = request?.client as any
            const statusInfo = getStatusBadge(inv.status)

            return (
              <Link
                key={inv.id}
                href={`/provider/inbox/${request?.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary-blue">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">
                          {request?.title || 'Untitled Request'}
                        </div>
                        <Badge className={statusInfo.className}>
                          {getStatusIcon(inv.status)}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{client?.name || 'Anonymous'}</span>
                        {' • '}
                        {request?.location || 'Unknown location'}
                        {' • '}
                        {request?.timeline || 'No timeline'}
                      </div>
                      {isPremium && client?.phone && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          📞 {client.phone}
                        </div>
                      )}
                      {!isPremium && client?.phone && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          🔒 Premium providers can see client phone number
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 ml-4 flex-shrink-0">
                      {new Date(inv.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
