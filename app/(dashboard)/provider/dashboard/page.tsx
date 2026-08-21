// Inside dashboard/page.tsx, after fetching provider:
const { data: provider } = await supabase
  .from('service_providers')
  .select('business_name, phone, services_offered, serves_locations')
  .eq('id', user.id)
  .single()

// If provider hasn't completed setup, redirect to /provider/setup
if (!provider?.business_name || !provider?.phone || 
    !provider?.services_offered?.length || !provider?.serves_locations?.length) {
  redirect('/provider/setup')
}
