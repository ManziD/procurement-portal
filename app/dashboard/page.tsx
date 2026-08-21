import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Use getSession()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error('Dashboard: No session', sessionError)
    redirect('/login')
  }

  const user = session.user

  // Get user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If no profile, check if user is a provider
  if (!profile) {
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (provider) {
      redirect('/provider/dashboard')
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', user.id)
      .single()

    if (client) {
      redirect('/client/dashboard')
    }

    redirect('/')
  }

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
