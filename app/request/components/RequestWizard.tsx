'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KAMPALA_LOCATIONS } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface Provider {
  id: string
  business_name: string
  bio: string | null
  rating: number
  services_offered: string[]
  location: string | null
  is_verified: boolean
}

interface RequestWizardProps {
  categories: Category[]
}

type Step = 
  | 'category' 
  | 'description' 
  | 'location' 
  | 'providers' 
  | 'select-providers' 
  | 'phone' 
  | 'verify' 
  | 'confirm'

export default function RequestWizard({ categories }: RequestWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    timeline: '',
    division: '',
    parish: '',
    phone: '',
    name: '',
    verificationCode: '',
  })

  // Providers state
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  // Progress indicator
  const stepLabels: Record<Step, string> = {
    category: 'Service',
    description: 'Details',
    location: 'Location',
    providers: 'Providers',
    'select-providers': 'Select',
    phone: 'Phone',
    verify: 'Verify',
    confirm: 'Done'
  }
  const stepOrder: Step[] = ['category', 'description', 'location', 'providers', 'select-providers', 'phone', 'verify', 'confirm']
  const currentStepIndex = stepOrder.indexOf(step)

  // Fetch providers when category and location are set
  useEffect(() => {
    if (step === 'providers' && selectedCategoryId && formData.division) {
      fetchProviders()
    }
  }, [step, selectedCategoryId, formData.division])

  const fetchProviders = async () => {
    setLoadingProviders(true)
    setError(null)
    try {
      // Query providers that match category (services_offered contains category name) 
      // and are in the same division or have no location restriction
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, business_name, bio, rating, services_offered, location, is_verified')
        .contains('services_offered', [selectedCategoryName])
        .order('rating', { ascending: false })

      if (error) throw error

      // Filter by location: if provider has location, it should contain the division, or if null, include them
      const filtered = (data || []).filter(p => {
        if (!p.location) return true
        return p.location.toLowerCase().includes(formData.division.toLowerCase())
      })

      setAvailableProviders(filtered.slice(0, 10)) // show max 10
      setSelectedProviders([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingProviders(false)
    }
  }

  // Step 1: Category selection
  if (step === 'category') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">What service do you need?</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryId(cat.id)
                setSelectedCategoryName(cat.name)
                setStep('description')
              }}
              className="p-4 border rounded-lg hover:border-primary-blue hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{cat.icon || '🔧'}</div>
              <div className="font-medium">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 2: Description
  if (step === 'description') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Describe your service need</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              What do you need help with?
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service you need in detail..."
              className="w-full border rounded-lg px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium mb-1">
              When do you need it?
            </label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select timeline</option>
              <option value="ASAP">ASAP</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="This Week">This Week</option>
              <option value="Next Week">Next Week</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('category')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('location')}
              disabled={!formData.description || !formData.timeline}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Location
  if (step === 'location') {
    const divisions = Object.keys(KAMPALA_LOCATIONS)
    const parishes = formData.division ? KAMPALA_LOCATIONS[formData.division as keyof typeof KAMPALA_LOCATIONS] : []

    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Where are you located?</h1>
        <p className="text-gray-600 mb-6">Select your division and parish in Kampala.</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="division" className="block text-sm font-medium mb-1">
              Division
            </label>
            <select
              id="division"
              value={formData.division}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  division: e.target.value,
                  parish: '',
                })
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
            <label htmlFor="parish" className="block text-sm font-medium mb-1">
              Parish
            </label>
            <select
              id="parish"
              value={formData.parish}
              onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
              disabled={!formData.division}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {formData.division ? 'Select parish' : 'Select division first'}
              </option>
              {parishes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('description')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('providers')}
              disabled={!formData.division || !formData.parish}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Show providers (recommendations)
  if (step === 'providers') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Recommended providers near you</h1>
        <p className="text-gray-600 mb-6">
          We found {availableProviders.length} providers in {formData.division} that offer {selectedCategoryName}.
        </p>

        {loadingProviders && <p className="text-gray-500">Loading providers...</p>}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}

        {!loadingProviders && availableProviders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No providers found in your area for this service.</p>
            <button
              onClick={() => setStep('location')}
              className="mt-4 px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Try a different location
            </button>
          </div>
        )}

        {!loadingProviders && availableProviders.length > 0 && (
          <div className="space-y-4">
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
                  onClick={() => {
                    setSelectedProviders([provider.id])
                    setStep('select-providers')
                  }}
                  className="px-4 py-2 bg-primary-blue text-white rounded hover:bg-primary-dark"
                >
                  Select
                </button>
              </div>
            ))}
            <div className="text-center text-sm text-gray-500 mt-4">
              Select one provider to start. You'll be able to add more in the next step.
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep('location')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // Step 5: Select 2–3 providers
  if (step === 'select-providers') {
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
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Select up to 3 providers</h1>
        <p className="text-gray-600 mb-6">
          Choose the providers you'd like to invite. They'll receive your request and can submit a bid.
        </p>

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

        <div className="mt-6 text-sm text-gray-500">
          Selected {selectedProviders.length} of 3 providers.
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep('providers')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setStep('phone')}
            disabled={selectedProviders.length === 0}
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  // Step 6: Enter phone number
  if (step === 'phone') {
    const handleSendCode = async () => {
      setError(null)
      if (!formData.phone || formData.phone.length < 10) {
        setError('Please enter a valid phone number (e.g., 0750123456)')
        return
      }
      if (!formData.name) {
        setError('Please enter your name')
        return
      }

      // Generate a random 4-digit code (for demo, we'll just set it to "1234")
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      
      // In production, send SMS via Twilio/Africa's Talking
      // For now, we'll store the code in state and show it in the UI for testing
      setFormData({ ...formData, verificationCode: code })
      
      // Show the code for testing (remove later)
      alert(`Your verification code is: ${code}`)
      setVerificationSent(true)
      setStep('verify')
    }

    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Almost done! Enter your phone number</h1>
        <p className="text-gray-600 mb-6">
          We'll send a verification code to confirm your identity. Providers will contact you via this number.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Doe"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g., 0750123456"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-between">
            <button
              onClick={() => setStep('select-providers')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSendCode}
              disabled={!formData.name || !formData.phone}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send code
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 7: Verify code
  if (step === 'verify') {
    const [inputCode, setInputCode] = useState('')
    const [verifying, setVerifying] = useState(false)

    const handleVerify = async () => {
      setVerifying(true)
      setError(null)
      if (inputCode !== formData.verificationCode) {
        setError('Invalid code. Please try again.')
        setVerifying(false)
        return
      }

      // Code matches – submit the request
      await handleSubmit()
    }

    const handleSubmit = async () => {
      setSubmitting(true)
      setError(null)
      try {
        // 1. Insert or get client
        let clientId: string | null = null
        // Check if client exists
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', formData.phone)
          .maybeSingle()

        if (existingClient) {
          clientId = existingClient.id
        } else {
          // Insert new client
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              phone: formData.phone,
              name: formData.name,
              is_verified: true,
              verified_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (clientError) throw clientError
          clientId = newClient.id
        }

        // 2. Generate tracking token
        const trackingToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

        // 3. Insert service request
        const { data: request, error: requestError } = await supabase
          .from('service_requests')
          .insert({
            client_id: clientId,
            category_id: selectedCategoryId,
            title: `${selectedCategoryName} in ${formData.parish}`,
            description: formData.description,
            location: `${formData.parish}, ${formData.division}`,
            division: formData.division,
            parish: formData.parish,
            timeline: formData.timeline,
            tracking_token: trackingToken,
            status: 'INVITED',
          })
          .select('id')
          .single()

        if (requestError) throw requestError

        // 4. Insert invitations for selected providers
        const invitations = selectedProviders.map(providerId => ({
          request_id: request.id,
          provider_id: providerId,
          status: 'PENDING',
        }))

        const { error: inviteError } = await supabase
          .from('invitations')
          .insert(invitations)

        if (inviteError) throw inviteError

        // 5. Save tracking token for confirmation
        setTrackingToken(trackingToken)
        setStep('confirm')

      } catch (err: any) {
        setError(err.message)
      } finally {
        setSubmitting(false)
        setVerifying(false)
      }
    }

    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Verify your phone number</h1>
        <p className="text-gray-600 mb-6">
          We sent a 4-digit code to {formData.phone}. Enter it below to complete your request.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              maxLength={4}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g., 1234"
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-between">
            <button
              onClick={() => setStep('phone')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerify}
              disabled={!inputCode || inputCode.length !== 4 || verifying || submitting}
              className="px-6 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifying || submitting ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 8: Confirmation
  if (step === 'confirm') {
    const trackingUrl = `${window.location.origin}/track/${trackingToken}`

    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-primary-blue mb-4">Your request has been sent!</h1>
        <p className="text-gray-600 mb-6">
          We've notified the providers you selected. They'll review your request and submit bids soon.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">📋 Track your request anytime using this link:</p>
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue underline break-all"
          >
            {trackingUrl}
          </a>
          <p className="text-xs text-gray-400 mt-2">
            We've also sent this link to your phone via SMS.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </a>
          <a
            href={trackingUrl}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Track Request
          </a>
        </div>
      </div>
    )
  }

  // Fallback (should never reach)
  return null
}
