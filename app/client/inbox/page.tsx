'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  otherUserId: string
  otherName: string
  requestId: string
  trackingToken: string
  lastMessage: string
  lastMessageTime: string
}

export default function ClientInbox() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    const loadConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          recipient_id,
          request_id,
          request:service_requests (
            tracking_token,
            status
          )
        `)
        .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        setLoading(false)
        return
      }

      const grouped = new Map<string, Conversation>()

      for (const msg of messages) {
        const otherId = msg.sender_id === session.user.id ? msg.recipient_id : msg.sender_id
        const request = msg.request as any

        if (!request || (request.status !== 'AWARDED' && request.status !== 'COMPLETED')) continue

        const key = `${otherId}-${msg.request_id}`

        if (!grouped.has(key)) {
          let otherName = 'Unknown'

          const { data: provider } = await supabase
            .from('service_providers')
            .select('business_name')
            .eq('id', otherId)
            .single()

          if (provider) {
            otherName = provider.business_name
          } else {
            const { data: client } = await supabase
              .from('clients')
              .select('name')
              .eq('id', otherId)
              .single()
            if (client) {
              otherName = client.name
            } else {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', otherId)
                .single()
              if (profile) {
                otherName = profile.full_name
              }
            }
          }

          grouped.set(key, {
            otherUserId: otherId,
            otherName,
            requestId: msg.request_id,
            trackingToken: request.tracking_token,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
          })
        }
      }

      setConversations(Array.from(grouped.values()))
      setLoading(false)
    }

    loadConversations()
  }, [router])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (conversations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Your Inbox</h1>
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No conversations yet. Start a job and message your provider.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Your Inbox</h1>
      <div className="space-y-3">
        {conversations.map((conv) => (
          <Link
            key={`${conv.otherUserId}-${conv.requestId}`}
            href={`/track/${conv.trackingToken}`}
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 bg-primary-blue/10">
                  <AvatarFallback className="text-primary-blue">
                    {conv.otherName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{conv.otherName}</div>
                  <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
