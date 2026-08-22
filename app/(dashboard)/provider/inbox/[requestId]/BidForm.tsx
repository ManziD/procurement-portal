'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BidFormProps {
  requestId: string
  existingBid?: any
}

export default function BidForm({ requestId, existingBid }: BidFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    price: existingBid?.price || '',
    timeline: existingBid?.timeline || '',
    message: existingBid?.message || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Get the session to retrieve the access token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('You must be logged in to submit a bid')
      }

      // 2. Make the API request with the token
      const res = await fetch('/api/provider/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          price: parseInt(form.price),
          timeline: form.timeline,
          message: form.message,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit bid')
      }

      // 3. Refresh the page to show the updated bid
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Quote (UGX) *</label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="e.g., 150000"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Timeline *</label>
        <Input
          value={form.timeline}
          onChange={(e) => setForm({ ...form, timeline: e.target.value })}
          placeholder="e.g., 2 hours, Tomorrow morning"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message (optional)</label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3}
          placeholder="Explain why you're the best choice..."
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-accent-orange hover:bg-opacity-90 text-white"
      >
        {loading ? 'Submitting...' : existingBid ? 'Update Bid' : 'Submit Bid'}
      </Button>
    </form>
  )
}
