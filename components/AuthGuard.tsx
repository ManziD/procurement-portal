'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthGuard({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'CLIENT' | 'SERVICE_PROVIDER'
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // 2. If a specific role is required, check it
        if (requiredRole) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!profile || profile.role !== requiredRole) {
            // If user doesn't have the right role, redirect to home
            router.push('/')
            return
          }
        }

        // 3. If all checks pass, show the content
        setAuthorized(true)
      } catch (error) {
        console.error('AuthGuard error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  if (!authorized) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
