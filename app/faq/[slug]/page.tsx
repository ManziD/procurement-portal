import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarkdownLite from '@/components/MarkdownLite'

export const revalidate = 3600 // rebuild in the background every hour

interface Faq {
  slug: string
  question: string
  answer_md: string
  meta_description: string | null
  categories: { name: string; slug: string } | null
}

export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data } = await supabase.from('faqs').select('slug')
  return (data || []).map((q) => ({ slug: q.slug }))
}

async function getFaq(slug: string): Promise<Faq | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('faqs')
    .select('slug, question, answer_md, meta_description, categories(name, slug)')
    .eq('slug', slug)
    .single()
  return data as unknown as Faq | null
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getFaq(params.slug)
  if (!data) return { title: 'Question not found – ServiceHub-Ug' }
  return {
    title: `${data.question} – ServiceHub-Ug`,
    description: data.meta_description || data.answer_md.slice(0, 155),
  }
}

export default async function FaqSlugPage({ params }: { params: { slug: string } }) {
  const data = await getFaq(params.slug)
  if (!data) notFound()

  return (
    <article className="container mx-auto px-4 py-10 max-w-2xl">
      {data.categories && (
        <Link
          href={`/services/${data.categories.slug}`}
          className="text-sm text-primary-blue hover:underline"
        >
          &larr; More {data.categories.name} questions
        </Link>
      )}
      <h1 className="text-3xl font-bold mt-3 mb-6">{data.question}</h1>
      <MarkdownLite markdown={data.answer_md} />

      {data.categories && (
        <Link
          href={`/browse?category=${encodeURIComponent(data.categories.name)}`}
          className="inline-block mt-8 px-6 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Request a {data.categories.name} provider
        </Link>
      )}
    </article>
  )
}
