import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'

export const revalidate = 3600

interface Faq {
  slug: string
  question: string
  categories: { name: string; slug: string } | null
}

const title = 'Frequently Asked Questions – ServiceHub-Ug'
const description =
  'Answers to common questions about hiring verified service providers in Kampala — plumbing, electrical, IT support, legal, and more.'

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: '/faq',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export default async function FaqIndexPage() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('faqs')
    .select('slug, question, categories(name, slug)')
    .order('question')

  const faqs = (data || []) as unknown as Faq[]

  const grouped = faqs.reduce<Record<string, { slug: string; items: Faq[] }>>((acc, q) => {
    const categoryName = q.categories?.name || 'General'
    const categorySlug = q.categories?.slug || 'general'
    if (!acc[categoryName]) acc[categoryName] = { slug: categorySlug, items: [] }
    acc[categoryName].items.push(q)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

      {Object.entries(grouped).map(([categoryName, { slug, items }]) => (
        <section key={categoryName} className="mb-10">
          <h2 className="text-xl font-semibold text-primary-blue mb-3">
            <Link href={`/services/${slug}`} className="hover:underline">
              {categoryName}
            </Link>
          </h2>
          <ul className="space-y-3">
            {items.map((q) => (
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
        </section>
      ))}
    </div>
  )
}
