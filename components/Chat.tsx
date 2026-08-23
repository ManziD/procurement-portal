'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'

interface ChatProps {
  requestId: string
  currentUserId: string
  recipientId: string
  recipientName: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  is_read: boolean
}

export default function Chat({ requestId, currentUserId, recipientId, recipientName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          request_id: requestId,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim(),
        })

      if (error) throw error
      setNewMessage('')
      await fetchMessages()
      scrollToBottom()
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages()
    // Optional: set up polling every 5 seconds for new messages (replaces realtime)
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [requestId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading messages...</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm text-gray-700">
        💬 Chat with {recipientName}
      </div>

      {/* Messages */}
      <div className="h-60 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isOwn ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-2 bg-gray-50 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={sending}
        />
        <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="sm" className="bg-primary-blue hover:bg-primary-dark">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {error && <div className="text-red-500 text-xs px-4 py-1">{error}</div>}
    </div>
  )
}
