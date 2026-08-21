'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // 1. Check if user is logged in (using client-side session)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // 2. Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        // 3. Redirect based on role
        if (profile?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (profile?.role === 'CLIENT') {
          router.push('/client/dashboard')
        } else if (profile?.role === 'SERVICE_PROVIDER') {
          router.push('/provider/dashboard')
        } else {
          // If no profile, check if user is in service_providers or clients
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
          
          router.push('/')
        }
      } catch (error) {
        console.error('Dashboard error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAndRedirect()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}
