'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function DashboardNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Get session from client‑side storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session) {
          // No session – redirect to login
          router.push('/login')
          return
        }

        // 2. Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          // Profile missing – try to detect if user is a provider or client
          const { data: provider } = await supabase
            .from('service_providers')
            .select('id')
            .eq('id', session.user.id)
            .single()
          if (provider) {
            router.push('/provider/dashboard')
            return
          }
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('id', session.user.id)
            .single()
          if (client) {
            router.push('/client/dashboard')
            return
          }
          // No role found – go home
          router.push('/')
          return
        }

        // 3. Redirect based on role
        if (profile.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (profile.role === 'CLIENT') {
          router.push('/client/dashboard')
        } else if (profile.role === 'SERVICE_PROVIDER') {
          router.push('/provider/dashboard')
        } else {
          router.push('/')
        }
      } catch (err: any) {
        console.error('Dashboard error:', err)
        setError(err.message || 'Something went wrong')
        // Optionally redirect to login
        // router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button onClick={() => window.location.href = '/login'} className="mt-4 text-primary-blue underline">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return null // Will redirect via useEffect
}
