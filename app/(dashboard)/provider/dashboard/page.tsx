// Add at the very top after getting the user
import { redirect } from 'next/navigation'

// Inside the page component, after fetching provider:
const { data: provider } = await supabase
  .from('service_providers')
  .select('business_name, phone, services_offered, serves_locations')
  .eq('id', user.id)
  .single()

// If no business_name, redirect to setup
if (!provider?.business_name || !provider?.phone || 
    !provider?.services_offered?.length || !provider?.serves_locations?.length) {
  redirect('/provider/setup')
}
