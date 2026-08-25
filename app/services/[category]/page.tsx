import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface Category {
  id: string
  name: string
}

interface QuestionSummary {
  slug: string
  question: string
}

function slugifyCategory(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function generateStaticParams() {
  const supabase = createClient(cookies())
  const { data } = await supabase.from('categories').select('name')
  return (data || []).map((c) => ({ category: slugifyCategory(c.name) }))
}

async function getCategoryData(categorySlug: string) {
  const supabase = createClient(cookies())

  const { data: categories } = await supabase.from('categories').select('id, name')
  const category = (categories || []).find(
    (c) => slugifyCategory(c.name) === categorySlug
  ) as Category | undefined

  if (!category) return null

  const { data: questions } = await supabase
    .from('questions')
    .select('slug, question')
    .eq('category_id', category.id)
    .order('created_at')

  return { category, questions: (questions || []) as QuestionSummary[] }
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const data = await getCategoryData(params.category)
  if (!data) return { title: 'Not found – ServiceHub-Ug' }
  return {
    title: `${data.category.name} Services in Kampala – ServiceHub-Ug`,
    description: `Find verified ${data.category.name.toLowerCase()} providers in Kampala. Common questions about ${data.category.name.toLowerCase()} services, pricing, and how to get started.`,
  }
}

export default async function CategoryHubPage({
  params,
}: {
  params: { category: string }
}) {
  const data = await getCategoryData(params.category)
  if (!data) notFound()

  const { category, questions } = data

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-3">{category.name} Services in Kampala</h1>
      <p className="text-lg text-gray-600 mb-8">
        Find verified {category.name.toLowerCase()} providers in Kampala. Below are
        common questions clients ask before booking.
      </p>

      <Link
        href={`/browse?category=${encodeURIComponent(category.name)}`}
        className="inline-block mb-8 px-6 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Request a {category.name} provider
      </Link>

      {questions.length > 0 ? (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li key={q.slug}>
              <Link
                href={`/faq/${q.slug}`}
                className="block p-4 border rounded-lg hover:border-primary-blue hover:shadow-md transition-all"
              >
                <span className="font-medium">{q.question}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No questions yet for this category.</p>
      )}
    </div>
  )
}
