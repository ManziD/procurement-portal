'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    // In production, integrate with payment gateway (Mobile Money, card)
    // For now, we'll just update the provider's premium status manually
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Simulate payment success – just set premium for 1 year
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      const { error: updateError } = await supabase
        .from('service_providers')
        .update({
          is_premium: true,
          premium_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      alert('Premium activated! You can now see client phone numbers.')
      router.push('/provider/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Premium Subscription</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0 UGX</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">✅ Receive invitations</li>
              <li className="flex items-center gap-2">✅ Submit bids</li>
              <li className="flex items-center gap-2">❌ See client phone numbers</li>
              <li className="flex items-center gap-2">❌ Priority in recommendations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Premium plan */}
        <Card className="border-accent-orange shadow-lg">
          <CardHeader className="bg-accent-orange/5">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-orange" />
              Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent-orange">15,000 UGX</p>
            <p className="text-sm text-gray-500">per year</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2">✅ Receive invitations</li>
              <li className="flex items-center gap-2">✅ Submit bids</li>
              <li className="flex items-center gap-2">✅ See client phone numbers</li>
              <li className="flex items-center gap-2">✅ Priority in recommendations</li>
              <li className="flex items-center gap-2">✅ Early access to new features</li>
            </ul>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full mt-6 bg-accent-orange hover:bg-opacity-90 text-white"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
