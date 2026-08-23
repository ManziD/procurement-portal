'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { KAMPALA_LOCATIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  icon: string | null
}

// Emoji mapping (same as public wizard)
const emojiMap: Record<string, string> = {
  'Sparkle': '✨',
  'Wrench': '🔧',
  'Zap': '⚡',
  'Globe': '🌐',
  'Palette': '🎨',
  'GraduationCap': '🎓',
  'Utensils': '🍽️',
  'Shield': '🛡️',
  'HardHat': '⛑️',
  'Monitor': '🖥️',
  'Camera': '📷',
  'Scale': '⚖️',
  'Calculator': '🧮',
}

export default function ClientRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')

  const [division, setDivision] = useState<string>('')
  const [parish, setParish] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  const [step, setStep] = useState<'category' | 'location' | 'providers' | 'confirm'>('category')

  // Fetch categories and check auth on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name')
      setCategories(categoriesData || [])

      setLoading(false)
    }

    loadData()
  }, [])

  // Provider selection state
  const [availableProviders, setAvailableProviders] = useState<any[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)

  // Fetch providers when category and location are set
  useEffect(() => {
    if (step === 'providers' && selectedCategoryName && division) {
      fetchProviders()
    }
  }, [step, selectedCategoryName, division])

  const fetchProviders = async () => {
    setLoadingProviders(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, business_name, bio, rating, services_offered, serves_locations, is_verified')
        .contains('services_offered', [selectedCategoryName])
        .order('rating', { ascending: false })

      if (error) throw error

      const filtered = (data || []).filter(p =>
        p.serves_locations && p.serves_locations.includes(division)
      )

      setAvailableProviders(filtered.slice(0, 10))
      setSelectedProviders([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      if (!user || !profile) {
        setError('You must be logged in')
        return
      }

      if (!selectedCategoryId || !division || !parish) {
        setError('Please fill in all fields')
        return
      }

      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number')
        return
      }

      if (selectedProviders.length === 0) {
        setError('Please select at least one provider')
        return
      }

      const { data: request, error: requestError } = await supabase
        .from('service_requests')
        .insert({
          profile_id: user.id,
          category_id: selectedCategoryId,
          title: `${selectedCategoryName} in ${parish}`,
          description: '',
          location: `${parish}, ${division}`,
          division: division,
          parish: parish,
          timeline: 'ASAP',
          status: 'INVITED',
          client_id: null,
          client_phone: phone,
        })
        .select('id, tracking_token')
        .single()

      if (requestError) throw requestError

      const invitations = selectedProviders.map(providerId => ({
        request_id: request.id,
        provider_id: providerId,
        status: 'PENDING',
      }))

      const { error: inviteError } = await supabase
        .from('invitations')
        .insert(invitations)

      if (inviteError) throw inviteError

      setTrackingToken(request.tracking_token)
      setSuccess(true)
      setStep('confirm')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ... (loading, not logged in, success states)

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-primary-blue">Please Log In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">You need to be logged in to post a request.</p>
            <Link href="/login">
              <Button className="bg-primary-blue hover:bg-primary-dark">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && trackingToken) {
    const trackingUrl = `${window.location.origin}/track/${trackingToken}`
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary-blue mb-2">Request Created!</h2>
            <p className="text-gray-600 mb-6">
              Your request has been posted. Providers will be invited to bid on it.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Track your request:</p>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-blue underline break-all"
              >
                {trackingUrl}
              </a>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/portal">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Link href="/client/request">
                <Button className="bg-accent-orange hover:bg-opacity-90 text-white">
                  Post Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STEP 1: CATEGORY
  if (step === 'category') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">What service do you need?</CardTitle>
            <p className="text-gray-600">Select the category that best describes your need.</p>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                      setSelectedCategoryName(cat.name)
                      setStep('location')
                    }}
                    className={`p-4 border rounded-lg text-center transition-all hover:shadow-md ${
                      selectedCategoryId === cat.id
                        ? 'border-primary-blue bg-primary-blue/5'
                        : 'border-gray-200 hover:border-primary-blue'
                    }`}
                  >
                    <div className="text-2xl mb-1">{emojiMap[cat.icon || ''] || '🔧'}</div>
                    <div className="font-medium text-sm">{cat.name}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <Link href="/portal">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STEP 2: LOCATION
  if (step === 'location') {
    const divisions = Object.keys(KAMPALA_LOCATIONS)
    const parishes = division ? KAMPALA_LOCATIONS[division as keyof typeof KAMPALA_LOCATIONS] : []

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">Where are you?</CardTitle>
            <p className="text-gray-600">Select your division and parish in Kampala.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value)
                    setParish('')
                  }}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parish</label>
                <select
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  disabled={!division}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {division ? 'Select parish' : 'Select division first'}
                  </option>
                  {parishes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('category')}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('providers')}
                  disabled={!division || !parish}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STEP 3: PROVIDER SELECTION
  if (step === 'providers') {
    const toggleProvider = (id: string) => {
      setSelectedProviders(prev => {
        if (prev.includes(id)) {
          return prev.filter(p => p !== id)
        } else {
          if (prev.length >= 3) return prev
          return [...prev, id]
        }
      })
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">Choose providers to invite</CardTitle>
            <p className="text-gray-600">
              Select up to 3 providers in {division} that offer {selectedCategoryName}.
              They'll receive your request and can submit a bid.
            </p>
          </CardHeader>
          <CardContent>
            {loadingProviders && <p className="text-gray-500">Loading providers...</p>}

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}

            {!loadingProviders && availableProviders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No providers found in {division} for {selectedCategoryName}.</p>
                <button
                  onClick={() => setStep('location')}
                  className="mt-4 px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Try a different location
                </button>
              </div>
            )}

            {!loadingProviders && availableProviders.length > 0 && (
              <div className="space-y-3">
                {availableProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="font-semibold">{provider.business_name}</div>
                      <div className="text-sm text-gray-600">{provider.bio || 'No bio yet'}</div>
                      <div className="text-sm text-gray-500">
                        ⭐ {provider.rating || 'N/A'} • {provider.is_verified ? '✅ Verified' : 'Unverified'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProvider(provider.id)}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedProviders.includes(provider.id)
                          ? 'bg-primary-blue text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {selectedProviders.includes(provider.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loadingProviders && availableProviders.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Selected {selectedProviders.length} of 3 providers.
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('location')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={selectedProviders.length === 0}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STEP 4: CONFIRM & PHONE
  if (step === 'confirm') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">Almost done</CardTitle>
            <p className="text-gray-600">Enter your phone number so providers can reach you.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 0750123456"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps us identify your request and send you updates.
                </p>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('providers')}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!phone || submitting}
                  className="px-6 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Post Request'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
