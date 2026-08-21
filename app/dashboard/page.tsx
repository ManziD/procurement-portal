import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Use getSession() – it's more reliable than getUser()
  const { data: { session }, error } = await supabase.auth.getSession()

  // Debug: log to Vercel console
  console.log('[Dashboard] Session:', session?.user?.email, 'Error:', error)

  if (!session) {
    console.log('[Dashboard] No session, redirecting to login')
    redirect('/login')
  }

  const user = session.user

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.log('[Dashboard] No profile for user', user.id, profileError)
    redirect('/')
  }

  console.log('[Dashboard] Role:', profile.role, 'Redirecting...')

  // Redirect based on role
  switch (profile.role) {
    case 'ADMIN':
      redirect('/admin/dashboard')
    case 'CLIENT':
      redirect('/client/dashboard')
    case 'SERVICE_PROVIDER':
      redirect('/provider/dashboard')
    default:
      redirect('/')
  }
}
