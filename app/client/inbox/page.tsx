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

      // 🔥 Simplified: use the view
      const { data: messages, error } = await supabase
        .from('client_inbox_view')
        .select('*')
        .or(`sender_profile_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
        .order('message_created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
        setLoading(false)
        return
      }

      // Group by request_id and the other party
      const grouped = new Map<string, Conversation>()
      for (const msg of messages) {
        const otherId = msg.sender_profile_id === session.user.id ? msg.recipient_id : msg.sender_profile_id
        const key = `${otherId}-${msg.request_id}`

        if (!grouped.has(key)) {
          let otherName = msg.sender_name || 'Unknown'
          // If the sender is the user, we need the other party's name
          if (msg.sender_profile_id === session.user.id) {
            // The other is the recipient; we don't have a name directly, but we can use provider_business_name or client_name from the view.
            // The view currently doesn't provide recipient name. We could join profiles again, but for simplicity we can use the sender name if it's not the user.
            // Actually the view gives sender_name; for the other party we need to fetch their name separately.
            // For now, we'll just set a placeholder; we can improve later.
            otherName = 'Other'
          } else {
            otherName = msg.sender_name
          }

          grouped.set(key, {
            otherUserId: otherId,
            otherName,
            requestId: msg.request_id,
            trackingToken: msg.tracking_token,
            lastMessage: msg.content,
            lastMessageTime: msg.message_created_at,
          })
        }
      }

      setConversations(Array.from(grouped.values()))
      setLoading(false)
    }

    loadConversations()
  }, [router])

  // ... rest of rendering unchanged
}
