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

export default function ProviderSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)

  // Form state
  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    bio: '',
    services: [] as string[],
    locations: [] as string[],
  })

  // Check if provider already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: provider } = await supabase
        .from('service_providers')
        .select('business_name, phone, bio, services_offered, serves_locations')
        .eq('id', user.id)
        .single()

      setChecking(false)

      // If provider already has a business name, they've completed setup
      if (provider?.business_name) {
        router.push('/provider/dashboard')
        return
      }

      // Pre-fill any existing data
      if (provider) {
        setForm({
          business_name: provider.business_name || '',
          phone: provider.phone || '',
          bio: provider.bio || '',
          services: provider.services_offered || [],
          locations: provider.serves_locations || [],
        })
      }
    }

    checkProfile()
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

    // Insert or update provider profile
    const { error: updateError } = await supabase
      .from('service_providers')
      .upsert({
        id: user.id,
        business_name: form.business_name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim() || null,
        services_offered: form.services,
        serves_locations: form.locations,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)

    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      router.push('/provider/dashboard')
    }, 1500)
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">Profile Complete!</h2>
            <p className="text-gray-600 mt-2">Your business profile has been set up successfully.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const divisions = Object.keys(KAMPALA_LOCATIONS)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary-blue">Set Up Your Business Profile</CardTitle>
          <p className="text-gray-600 text-sm">Complete your profile to start receiving service requests from clients.</p>
        </CardHeader>
        <CardContent>
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
              <label className="block text-sm font-medium mb-1">Bio (optional)</label>
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

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-accent-orange hover:bg-opacity-90 text-white"
            >
              {saving ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
