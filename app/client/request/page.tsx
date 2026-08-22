'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)

  // Step 1: Category selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')

  // Step 2: Location selection
  const [division, setDivision] = useState<string>('')
  const [parish, setParish] = useState<string>('')

  // Step state
  const [step, setStep] = useState<'category' | 'location' | 'confirm'>('category')

  // Icon mapping
  const iconMap: Record<string, any> = {
    'Sparkle': Icons.Sparkle,
    'Wrench': Icons.Wrench,
    'Zap': Icons.Zap,
    'Globe': Icons.Globe,
    'Palette': Icons.Palette,
    'GraduationCap': Icons.GraduationCap,
    'Utensils': Icons.Utensils,
    'Shield': Icons.Shield,
    'HardHat': Icons.HardHat,
    'Monitor': Icons.Monitor,
    'Camera': Icons.Camera,
    'Scale': Icons.Scale,
    'Calculator': Icons.Calculator,
  }

  // Fetch categories and check auth on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      // 2. Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      // 3. Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name')
      setCategories(categoriesData || [])

      setLoading(false)
    }

    loadData()
  }, [])

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

      // Insert service request
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
        })
        .select('id, tracking_token')
        .single()

      if (requestError) throw requestError

      setTrackingToken(request.tracking_token)
      setSuccess(true)
      setStep('confirm')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  // --- NOT LOGGED IN ---
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

  // --- SUCCESS ---
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

  // --- STEP 1: CATEGORY ---
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
                {categories.map((cat) => {
                  const IconComponent = iconMap[cat.icon || '']
                  return (
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
                      <div className="text-2xl mb-1 flex justify-center">
                        {IconComponent ? (
                          <IconComponent className="w-8 h-8 text-primary-blue" />
                        ) : (
                          <span>🔧</span>
                        )}
                      </div>
                      <div className="font-medium text-sm">{cat.name}</div>
                    </button>
                  )
                })}
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

  // --- STEP 2: LOCATION ---
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

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('category')}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!division || !parish || submitting}
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

  // --- FALLBACK (should not reach) ---
  return null
}
