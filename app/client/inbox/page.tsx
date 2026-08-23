import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, MessageCircle } from 'lucide-react'

export default async function ClientInbox() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch requests where the client is the profile_id and status is AWARDED or COMPLETED
  const { data: requests } = await supabase
    .from('service_requests')
    .select('*')
    .eq('profile_id', user.id)
    .in('status', ['AWARDED', 'COMPLETED'])
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Your Inbox</h1>
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No active conversations. Start a job by accepting a bid.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Link key={req.id} href={`/track/${req.tracking_token}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{req.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {req.location}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={req.status === 'AWARDED' ? 'bg-green-500' : 'bg-gray-500'}>
                      {req.status}
                    </Badge>
                    <MessageCircle className="h-5 w-5 text-primary-blue" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
