import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function InboxRedirect() {
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
    // Fallback: try to detect if provider or client
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', user.id)
      .single()
    if (provider) {
      redirect('/provider/inbox')
    }
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', user.id)
      .single()
    if (client) {
      redirect('/client/inbox')
    }
    redirect('/')
  }

  if (profile.role === 'CLIENT') {
    redirect('/client/inbox')
  } else if (profile.role === 'SERVICE_PROVIDER') {
    redirect('/provider/inbox')
  } else {
    redirect('/')
  }
}
