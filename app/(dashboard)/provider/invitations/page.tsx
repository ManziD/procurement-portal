import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const statusFilter = searchParams.status || 'all'

  let query = supabase
    .from('invitations')
    .select('*, request:service_requests(*)')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter.toUpperCase())
  }

  const { data: invitations } = await query

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Invitations</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link href="/provider/invitations">
          <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm">
            All
          </Button>
        </Link>
        <Link href="/provider/invitations?status=pending">
          <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm">
            Pending
          </Button>
        </Link>
        <Link href="/provider/invitations?status=viewed">
          <Button variant={statusFilter === 'viewed' ? 'default' : 'outline'} size="sm">
            Viewed
          </Button>
        </Link>
        <Link href="/provider/invitations?status=bid_submitted">
          <Button variant={statusFilter === 'bid_submitted' ? 'default' : 'outline'} size="sm">
            Bid Submitted
          </Button>
        </Link>
      </div>

      {invitations?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No invitations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations?.map((inv) => {
            const request = inv.request as any
            return (
              <Card key={inv.id}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="font-semibold">{request.title || request.description?.slice(0, 60)}</div>
                    <div className="text-sm text-gray-600">
                      {request.location} • {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge className={
                        inv.status === 'PENDING' ? 'bg-yellow-500' :
                        inv.status === 'VIEWED' ? 'bg-blue-500' :
                        inv.status === 'BID_SUBMITTED' ? 'bg-green-500' :
                        'bg-gray-500'
                      }>
                        {inv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/provider/invitations/${inv.request_id}`}>
                    <Button>View &amp; Bid</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
