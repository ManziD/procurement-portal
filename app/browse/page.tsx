import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import RequestWizard from '@/app/request/components/RequestWizard'

export const metadata = {
  title: 'Book a Service – ServiceHub-Ug',
  description: 'Find and book trusted service providers in Kampala, Uganda. Select a category, describe your need, and get bids from verified professionals.',
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch categories for the wizard
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('name')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <RequestWizard
        categories={categories || []}
        initialCategoryName={searchParams.category}
      />
    </div>
  )
}
