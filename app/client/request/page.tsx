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

export default function ClientRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Step state
  type Step = 'category' | 'location' | 'providers' | 'confirm'
  const [step, setStep] = useState<Step>('category')

  // Category selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')

  // Location
  const [division, setDivision] = useState<string>('')
  const [parish, setParish] = useState<string>('')

  // Provider selection
  const [availableProviders, setAvailableProviders] = useState<any[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)

  // Phone
  const [phone, setPhone] = useState<string>('')

  // Load user, profile, categories
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
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
      if (!user || !profile) { setError('You must be logged in'); return }
      if (!selectedCategoryId || !division || !parish || !phone || phone.length < 10) {
        setError('Please fill all fields and enter a valid phone number')
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
          division,
          parish,
          timeline: 'ASAP',
          status: 'INVITED',
          client_id: null,
          client_phone: phone,
        })
        .select('id, tracking_token')
        .single()
      if (requestError) throw requestError

      const invitations = selectedProviders.map(pid => ({
        request_id: request.id,
        provider_id: pid,
        status: 'PENDING',
      }))
      const { error: inviteError } = await supabase.from('invitations').insert(invitations)
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

  // Loading
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle className="text-center text-primary-blue">Please Log In</CardTitle></CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">You need to be logged in to post a request.</p>
            <Link href="/login"><Button className="bg-primary-blue hover:bg-primary-dark">Log In</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success
  if (success && trackingToken) {
    const trackingUrl = `${window.location.origin}/track/${trackingToken}`
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary-blue mb-2">Request Created!</h2>
            <p className="text-gray-600 mb-6">Your request has been posted. Providers will be invited to bid on it.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Track your request:</p>
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-blue underline break-all">{trackingUrl}</a>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/portal"><Button variant="outline">Back to Dashboard</Button></Link>
              <Link href="/client/request"><Button className="bg-accent-orange hover:bg-opacity-90 text-white">Post Another</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Step 1: Category dropdown ----
  if (step === 'category') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">What service do you need?</CardTitle>
            <p className="text-gray-600">Select a category from the dropdown.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === e.target.value)
                    if (cat) {
                      setSelectedCategoryId(cat.id)
                      setSelectedCategoryName(cat.name)
                    }
                  }}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <Link href="/portal"><Button variant="outline">Cancel</Button></Link>
                <Button
                  onClick={() => setStep('location')}
                  disabled={!selectedCategoryId}
                  className="bg-primary-blue hover:bg-primary-dark"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Step 2: Location ----
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
                  onChange={(e) => { setDivision(e.target.value); setParish('') }}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select division</option>
                  {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parish</label>
                <select
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  disabled={!division}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100"
                >
                  <option value="">{division ? 'Select parish' : 'Select division first'}</option>
                  {parishes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('category')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
                <button
                  onClick={() => setStep('providers')}
                  disabled={!division || !parish}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
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

  // ---- Step 3: Providers ----
  if (step === 'providers') {
    const toggleProvider = (id: string) => {
      setSelectedProviders(prev =>
        prev.includes(id) ? prev.filter(p => p !== id) : (prev.length < 3 ? [...prev, id] : prev)
      )
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue">Choose providers to invite</CardTitle>
            <p className="text-gray-600">Select up to 3 providers in {division} that offer {selectedCategoryName}.</p>
          </CardHeader>
          <CardContent>
            {loadingProviders && <p className="text-gray-500">Loading providers...</p>}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}
            {!loadingProviders && availableProviders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No providers found in {division} for {selectedCategoryName}.</p>
                <button onClick={() => setStep('location')} className="mt-4 px-6 py-2 border rounded-lg hover:bg-gray-50">Try a different location</button>
              </div>
            )}
            {!loadingProviders && availableProviders.length > 0 && (
              <div className="space-y-3">
                {availableProviders.map(p => (
                  <div key={p.id} className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md">
                    <div>
                      <div className="font-semibold">{p.business_name}</div>
                      <div className="text-sm text-gray-600">{p.bio || 'No bio'}</div>
                      <div className="text-sm text-gray-500">⭐ {p.rating || 'N/A'} • {p.is_verified ? '✅ Verified' : 'Unverified'}</div>
                    </div>
                    <button
                      onClick={() => toggleProvider(p.id)}
                      className={`px-4 py-2 rounded transition-colors ${selectedProviders.includes(p.id) ? 'bg-primary-blue text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {selectedProviders.includes(p.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500">Selected {selectedProviders.length} of 3 providers.</div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep('location')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
              <button
                onClick={() => setStep('confirm')}
                disabled={selectedProviders.length === 0}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Step 4: Confirm & phone ----
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
                <label className="block text-sm font-medium mb-1">Phone number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 0750123456"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">We'll use this to identify your request.</p>
              </div>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep('providers')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={!phone || submitting}
                  className="px-6 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
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
