import { redirect } from 'next/navigation'

export default function RequestPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const categoryParam = searchParams.category ? `?category=${encodeURIComponent(searchParams.category)}` : ''
  redirect(`/browse${categoryParam}`)
}
