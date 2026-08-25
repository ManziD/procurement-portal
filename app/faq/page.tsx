import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'

export const revalidate = 3600

interface Question {
  slug: string
  question: string
  categories: { name: string } | null
}

export const metadata = {
  title: 'Frequently Asked Questions – ServiceHub-Ug',
  description:
    'Answers to common questions about hiring verified service providers in Kampala — plumbing, electrical, IT support, legal, and more.',
}

function slugifyCategory(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default async function FaqIndexPage() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('questions')
    .select('slug, question, categories(name)')
    .order('question')

  const questions = (data || []) as unknown as Question[]

  const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
    const categoryName = q.categories?.name || 'General'
    acc[categoryName] = acc[categoryName] || []
    acc[categoryName].push(q)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

      {Object.entries(grouped).map(([categoryName, items]) => (
        <section key={categoryName} className="mb-10">
          <h2 className="text-xl font-semibold text-primary-blue mb-3">
            <Link href={`/services/${slugifyCategory(categoryName)}`} className="hover:underline">
              {categoryName}
            </Link>
          </h2>
          <ul className="space-y-2">
            {items.map((q) => (
              <li key={q.slug}>
                <Link href={`/faq/${q.slug}`} className="hover:underline">
                  {q.question}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
