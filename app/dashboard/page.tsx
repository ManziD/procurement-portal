import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  console.log('=== /dashboard DIAGNOSTIC ===')
  console.log('Cookies present:', cookieStore.getAll().map(c => c.name))

  // 1. Try getSession – most reliable
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('Session:', session?.user?.email, 'Error:', sessionError)

  // 2. If session fails, try getUser as backup
  let user = session?.user || null
  if (!user) {
    const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
    console.log('getUser fallback:', userData?.email, 'Error:', userError)
    user = userData
  }

  if (!user) {
    console.log('No user found – redirecting to login')
    redirect('/login')
  }

  // 3. Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.log('No profile found for user', user.id, profileError)
    // Try to redirect to provider dashboard anyway as a fallback (if user exists)
    // Check if provider record exists
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', user.id)
      .single()
    if (provider) {
      console.log('Provider record exists – redirecting to provider dashboard')
      redirect('/provider/dashboard')
    }
    // If not, maybe client?
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', user.id)
      .single()
    if (client) {
      console.log('Client record exists – redirecting to client dashboard')
      redirect('/client/dashboard')
    }
    // Still no profile? Redirect home
    redirect('/')
  }

  console.log('Found role:', profile.role)

  // 4. Redirect based on role
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
