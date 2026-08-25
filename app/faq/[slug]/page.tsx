import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // rebuild in the background every hour

interface Question {
  slug: string
  question: string
  answer: string
  categories: { id: string; name: string } | null
}

export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data } = await supabase.from('questions').select('slug')
  return (data || []).map((q) => ({ slug: q.slug }))
}

async function getQuestion(slug: string): Promise<Question | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('questions')
    .select('slug, question, answer, categories(id, name)')
    .eq('slug', slug)
    .single()
  return data as unknown as Question | null
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getQuestion(params.slug)
  if (!data) return { title: 'Question not found – ServiceHub-Ug' }
  return {
    title: `${data.question} – ServiceHub-Ug`,
    description: data.answer.slice(0, 155),
  }
}

export default async function QuestionPage({ params }: { params: { slug: string } }) {
  const data = await getQuestion(params.slug)
  if (!data) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: data.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: data.answer,
        },
      },
    ],
  }

  return (
    <article className="container mx-auto px-4 py-10 max-w-2xl">
      {data.categories && (
        <Link
          href={`/services/${data.categories.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm text-primary-blue hover:underline"
        >
          &larr; More {data.categories.name} questions
        </Link>
      )}
      <h1 className="text-3xl font-bold mt-3 mb-4">{data.question}</h1>
      <p className="text-lg leading-relaxed whitespace-pre-line">{data.answer}</p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  )
}
