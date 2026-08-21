import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 🔍 DIAGNOSTIC: Check what we're getting
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Log to Vercel console
  console.log('=== /dashboard DIAGNOSTIC ===')
  console.log('User:', user)
  console.log('User error:', userError)
  console.log('Session:', session)
  console.log('Session error:', sessionError)
  console.log('Cookies:', cookieStore.getAll().map(c => c.name))

  if (!user) {
    // Fallback: try getSession as backup
    if (session) {
      // Session exists but getUser failed? Let's redirect to provider dashboard directly
      console.log('getUser failed but session exists – manually redirecting')
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role === 'SERVICE_PROVIDER') {
        redirect('/provider/dashboard')
      } else if (profile?.role === 'CLIENT') {
        redirect('/client/dashboard')
      } else if (profile?.role === 'ADMIN') {
        redirect('/admin/dashboard')
      }
    }
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/')
  }

  if (profile.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else if (profile.role === 'CLIENT') {
    redirect('/client/dashboard')
  } else if (profile.role === 'SERVICE_PROVIDER') {
    redirect('/provider/dashboard')
  } else {
    redirect('/')
  }
}
