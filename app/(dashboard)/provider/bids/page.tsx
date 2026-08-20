import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function BidsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: bids } = await supabase
    .from('bids')
    .select('*, request:service_requests(*)')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">My Bids</h1>
      </div>

      {bids?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">You haven't submitted any bids yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids?.map((bid) => {
            const request = bid.request as any
            return (
              <Card key={bid.id}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="font-semibold">{request.title || request.description?.slice(0, 60)}</div>
                    <div className="text-sm text-gray-600">
                      Quote: UGX {bid.price?.toLocaleString()} • Timeline: {bid.timeline}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge className={bid.status === 'ACCEPTED' ? 'bg-green-500' : bid.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {bid.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/provider/invitations/${request.id}`}>
                    <Button variant="outline" size="sm">View Request</Button>
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
