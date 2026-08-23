'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function InboxRedirect() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const handleRedirect = async () => {
      // Try to get session immediately
      let { data: { session } } = await supabase.auth.getSession()

      // If no session, wait for auth state change (session restored from storage)
      if (!session) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (newSession && isMounted) {
              await doRedirect(newSession)
            }
          }
        )

        // Cleanup subscription after 5 seconds (timeout)
        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          if (isMounted) {
            router.push('/login')
          }
        }, 5000)

        return () => {
          clearTimeout(timeout)
          subscription.unsubscribe()
        }
      } else {
        await doRedirect(session)
      }
    }

    const doRedirect = async (session: any) => {
      if (!isMounted) return

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // Try to detect role
        const { data: provider } = await supabase
          .from('service_providers')
          .select('id')
          .eq('id', session.user.id)
          .single()
        if (provider) {
          router.push('/provider/inbox')
          return
        }
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('id', session.user.id)
          .single()
        if (client) {
          router.push('/client/inbox')
          return
        }
        router.push('/')
        return
      }

      if (profile.role === 'CLIENT') {
        router.push('/client/inbox')
      } else if (profile.role === 'SERVICE_PROVIDER') {
        router.push('/provider/inbox')
      } else {
        router.push('/')
      }
    }

    handleRedirect()

    return () => {
      isMounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  return null
}
