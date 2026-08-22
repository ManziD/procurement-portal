'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES, KAMPALA_LOCATIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

export default function ProviderProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    bio: '',
    services: [] as string[],
    locations: [] as string[],
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: provider } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', user.id)
        .single()

      if (provider) {
        setForm({
          business_name: provider.business_name || '',
          phone: provider.phone || '',
          bio: provider.bio || '',
          services: provider.services_offered || [],
          locations: provider.serves_locations || [],
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const toggleService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const toggleLocation = (location: string) => {
    setForm(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Validate
    if (!form.business_name.trim()) {
      setError('Business name is required')
      setSaving(false)
      return
    }
    if (!form.phone.trim()) {
      setError('Phone number is required')
      setSaving(false)
      return
    }
    if (form.services.length === 0) {
      setError('Please select at least one service you offer')
      setSaving(false)
      return
    }
    if (form.locations.length === 0) {
      setError('Please select at least one location you serve')
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('service_providers')
      .update({
        business_name: form.business_name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim() || null,
        services_offered: form.services,
        serves_locations: form.locations,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
      </div>
    )
  }

  const divisions = Object.keys(KAMPALA_LOCATIONS)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Business Profile</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                placeholder="e.g., Kawempe Plumbing Services"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g., 0750123456"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Clients will contact you via this number.</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                placeholder="Tell clients about your experience, expertise, and what makes you stand out..."
              />
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Services You Offer <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select all services you provide.</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`px-3 py-2 rounded-full border text-sm transition-all ${
                      form.services.includes(service)
                        ? 'bg-primary-blue text-white border-primary-blue'
                        : 'border-gray-300 hover:border-primary-blue hover:bg-primary-blue/5'
                    }`}
                  >
                    {service}
                    {form.services.includes(service) && <Check className="inline ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
              {form.services.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Selected: {form.services.length} services</p>
              )}
            </div>

            {/* Locations Served */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Locations You Serve <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select all Kampala divisions where you provide services.</p>
              <div className="flex flex-wrap gap-2">
                {divisions.map((division) => (
                  <button
                    key={division}
                    type="button"
                    onClick={() => toggleLocation(division)}
                    className={`px-3 py-2 rounded-full border text-sm transition-all ${
                      form.locations.includes(division)
                        ? 'bg-primary-blue text-white border-primary-blue'
                        : 'border-gray-300 hover:border-primary-blue hover:bg-primary-blue/5'
                    }`}
                  >
                    {division}
                    {form.locations.includes(division) && <Check className="inline ml-1 h-3 w-3" />}
                  </button>
                ))}
              </div>
              {form.locations.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Serving: {form.locations.join(', ')}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-200">
                Profile updated successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-blue hover:bg-primary-dark"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
