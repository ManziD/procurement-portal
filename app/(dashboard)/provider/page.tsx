import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, FileText, Star, Calendar } from 'lucide-react'

export default async function ProviderDashboard() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch provider info
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!provider) {
    return <div>Provider profile not found. Please set up your business profile.</div>
  }

  // Get invitations
  const { data: invitations, count: totalInvitations } = await supabase
    .from('invitations')
    .select('*, request:service_requests(*)', { count: 'exact' })
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  const pendingInvitations = invitations?.filter(i => i.status === 'PENDING').length || 0
  const viewedInvitations = invitations?.filter(i => i.status === 'VIEWED').length || 0
  const submittedBids = invitations?.filter(i => i.status === 'BID_SUBMITTED').length || 0

  // Get recent invitations
  const recentInvitations = invitations?.slice(0, 5) || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Provider Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/provider/invitations">
            <Button variant="outline" className="border-primary-blue text-primary-blue">
              View All Invitations
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invitations</p>
                <p className="text-2xl font-bold">{totalInvitations || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-primary-blue opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvitations}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bid Submitted</p>
                <p className="text-2xl font-bold text-blue-600">{submittedBids}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="text-2xl font-bold">{provider.rating || 'N/A'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvitations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No invitations yet. When clients choose you, they'll appear here.</p>
          ) : (
            <div className="space-y-4">
              {recentInvitations.map((inv) => {
                const request = inv.request as any
                return (
                  <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div>
                      <div className="font-medium">{request.title || request.description?.slice(0, 50)}</div>
                      <div className="text-sm text-gray-600">
                        {request.location} • {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      <Badge className={`mt-1 ${
                        inv.status === 'PENDING' ? 'bg-yellow-500' :
                        inv.status === 'VIEWED' ? 'bg-blue-500' :
                        inv.status === 'BID_SUBMITTED' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Link href={`/provider/invitations/${inv.request_id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium promo if not premium */}
      {!provider.is_premium && (
        <Card className="mt-6 border-accent-orange bg-accent-orange/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-accent-orange">Upgrade to Premium</h3>
                <p className="text-sm text-gray-600">See client phone numbers and get priority in recommendations.</p>
              </div>
              <Link href="/provider/subscription">
                <Button className="bg-accent-orange hover:bg-opacity-90 text-white">
                  Upgrade
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// (Need to import Clock icon)
import { Clock } from 'lucide-react'
