import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProviderDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch provider profile
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile incomplete, redirect to setup
  if (!provider?.business_name || !provider?.phone || 
      !provider?.services_offered?.length || !provider?.serves_locations?.length) {
    redirect('/provider/setup')
  }

  // ... rest of the dashboard code
}
