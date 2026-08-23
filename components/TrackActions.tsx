'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface TrackActionsProps {
  bidId: string
  requestId: string
  trackingToken: string
}

export default function TrackActions({ bidId, requestId, trackingToken }: TrackActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (action: 'accept' | 'reject') => {
    setLoading(action)
    setError(null)

    try {
      const res = await fetch(`/api/track/${action}-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          bidId,
          requestId,
          trackingToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to ${action} bid`)
      }

      // Hard reload to reflect status changes
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setLoading(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction('accept')}
          disabled={loading !== null}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading === 'accept' ? '...' : 'Accept'}
        </Button>
        <Button
          onClick={() => handleAction('reject')}
          disabled={loading !== null}
          variant="destructive"
        >
          {loading === 'reject' ? '...' : 'Reject'}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
