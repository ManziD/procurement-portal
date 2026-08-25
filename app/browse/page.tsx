import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import RequestWizard from '@/app/request/components/RequestWizard'

export const metadata = {
  title: 'Book a Service – ServiceHub-Ug',
  description: 'Find and book trusted service providers in Kampala, Uganda. Select a category, describe your need, and get bids from verified professionals.',
}

interface Category {
  id: string
  name: string
  icon: string | null
}

// Matches a typed search term to a category name:
// 1. Exact match (case-insensitive)
// 2. Substring match, either direction (e.g. "web design" -> "Web Design Services")
// 3. Shared word-stem match (e.g. "plumber" -> "Plumbing", "photographer" -> "Photography")
function findMatchingCategory(categories: Category[], query: string): string | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined

  const exact = categories.find((c) => c.name.toLowerCase() === q)
  if (exact) return exact.name

  const substring = categories.find(
    (c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase())
  )
  if (substring) return substring.name

  const stem = (s: string) => s.slice(0, 5)
  const qWords = q.split(/\s+/)
  const stemMatch = categories.find((c) =>
    qWords.some((w) => stem(w).length >= 4 && stem(c.name.toLowerCase()) === stem(w))
  )
  if (stemMatch) return stemMatch.name

  return undefined
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch categories for the wizard
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('name')

  const allCategories = categories || []

  // If a keyword search was typed (from the Navbar search bar), try to match
  // it to a category name so the wizard opens straight into that category.
  const matchedFromQuery = searchParams.q
    ? findMatchingCategory(allCategories, searchParams.q)
    : undefined

  const initialCategoryName = searchParams.category || matchedFromQuery
  const unmatchedSearchQuery =
    searchParams.q && !matchedFromQuery ? searchParams.q : undefined

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <RequestWizard
        categories={allCategories}
        initialCategoryName={initialCategoryName}
        unmatchedSearchQuery={unmatchedSearchQuery}
      />
    </div>
  )
}
