'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function DashboardRedirect() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // No profile – try to detect if it's a provider or client
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
        return
      }

      // Redirect based on role
      switch (profile.role) {
        case 'ADMIN':
          router.push('/admin/dashboard')
          break
        case 'CLIENT':
          router.push('/client/dashboard')
          break
        case 'SERVICE_PROVIDER':
          router.push('/provider/dashboard')
          break
        default:
          router.push('/')
      }
    }

    checkAuth()
  }, [router])

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return null
}
