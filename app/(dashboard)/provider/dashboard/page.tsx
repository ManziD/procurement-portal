import AuthGuard from '@/components/AuthGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, FileText, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// The actual dashboard content (server component)
async function ProviderDashboardContent() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch provider data and invitations (server-side)
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*')
    .single()

  const { data: invitations, count: totalInvitations } = await supabase
    .from('invitations')
    .select('*, request:service_requests(*)', { count: 'exact' })
    .eq('provider_id', provider?.id || '')
    .order('created_at', { ascending: false })

  const pendingInvitations = invitations?.filter(i => i.status === 'PENDING').length || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Provider Dashboard</h1>
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
                <p className="text-sm text-gray-500">Rating</p>
                <p className="text-2xl font-bold">{provider?.rating || 'N/A'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bids Submitted</p>
                <p className="text-2xl font-bold">{invitations?.filter(i => i.status === 'BID_SUBMITTED').length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the dashboard content */}
    </div>
  )
}

// The exported page – wrapped with AuthGuard
export default function ProviderDashboardPage() {
  return (
    <AuthGuard requiredRole="SERVICE_PROVIDER">
      <ProviderDashboardContent />
    </AuthGuard>
  )
}
