import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import RequestWizard from './components/RequestWizard'

export default async function RequestPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('name')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <RequestWizard categories={categories || []} />
    </div>
  )
}
