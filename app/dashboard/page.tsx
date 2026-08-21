import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // If no profile, redirect to setup or home
    redirect('/')
  }

  // Redirect based on role
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
