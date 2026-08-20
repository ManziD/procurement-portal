'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    bio: '',
    services_offered: '',
    location: '',
    nin: '',
    business_reg_number: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          business_name: data.business_name || '',
          bio: data.bio || '',
          services_offered: data.services_offered?.join(', ') || '',
          location: data.location || '',
          nin: data.nin || '',
          business_reg_number: data.business_reg_number || '',
        })
      }
    }
    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setLoading(false)
      return
    }

    const servicesArray = form.services_offered.split(',').map(s => s.trim()).filter(Boolean)

    const { error: updateError } = await supabase
      .from('service_providers')
      .update({
        business_name: form.business_name,
        bio: form.bio,
        services_offered: servicesArray,
        location: form.location,
        nin: form.nin,
        business_reg_number: form.business_reg_number,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Business Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name *</label>
              <Input
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                placeholder="Tell clients about your experience and expertise..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Services Offered (comma separated)</label>
              <Input
                value={form.services_offered}
                onChange={(e) => setForm({ ...form, services_offered: e.target.value })}
                placeholder="e.g., Plumbing, Pipe Installation, Leak Repair"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location (Kampala division)</label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Kawempe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIN (optional)</label>
              <Input
                value={form.nin}
                onChange={(e) => setForm({ ...form, nin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Registration Number (optional)</label>
              <Input
                value={form.business_reg_number}
                onChange={(e) => setForm({ ...form, business_reg_number: e.target.value })}
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Profile updated successfully!</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
