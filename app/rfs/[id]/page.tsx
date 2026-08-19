import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, MapPin, User, Eye } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: rfs } = await supabase
    .from('requests_for_service')
    .select(`title, category:categories(name), division, parish, description`)
    .eq('id', id)
    .single()

  if (!rfs) {
    return { title: 'Service Request Not Found | ServiceHub-Ug' }
  }

  return {
    title: `${rfs.title} - ${rfs.category?.name || 'Service'} in ${rfs.division}, Kampala | ServiceHub-Ug`,
    description: `View this request for "${rfs.title}" in ${rfs.division}. ${rfs.description?.slice(0, 150) || ''}`,
  }
}

export default async function RFSDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: rfs, error } = await supabase
    .from('requests_for_service')
    .select(`*, category:categories(name), client:profiles(full_name, email)`)
    .eq('id', id)
    .single()

  if (error || !rfs) notFound()

  // Increment view count (fire-and-forget)
  try {
    await supabase
      .from('requests_for_service')
      .update({ views: (rfs.views || 0) + 1 })
      .eq('id', id)
  } catch {}

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: rfs.title,
    description: rfs.description,
    provider: { '@type': 'Organization', name: rfs.client?.full_name || 'Anonymous Client' },
    category: rfs.category?.name || 'Service',
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: rfs.parish,
        addressRegion: rfs.division,
        addressCountry: 'UG', // fixed duplicate
        name: `${rfs.parish}, ${rfs.division}, Kampala, Uganda`,
      },
    },
    offers: {
      '@type': 'Offer',
      price: rfs.budget,
      priceCurrency: 'UGX',
      availability: rfs.status === 'OPEN' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
    url: `https://servicehub-ug.com/rfs/${id}`,
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount)

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'bg-green-500',
      IN_PROGRESS: 'bg-yellow-500',
      AWARDED: 'bg-blue-500',
      COMPLETED: 'bg-gray-500',
      CANCELLED: 'bg-red-500',
    }
    return map[status] || 'bg-gray-500'
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Badge className={`${getStatusBadge(rfs.status)} text-white mb-2`}>{rfs.status}</Badge>
          <h1 className="text-3xl font-bold text-primary-blue">{rfs.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary-blue" />{rfs.location}</span>
            <span className="flex items-center"><CalendarIcon className="h-4 w-4 mr-1 text-primary-blue" />Deadline: {new Date(rfs.deadline).toLocaleDateString()}</span>
            <span className="flex items-center"><Eye className="h-4 w-4 mr-1 text-primary-blue" />{rfs.views || 0} views</span>
            <span className="flex items-center"><User className="h-4 w-4 mr-1 text-primary-blue" />Posted by {rfs.client?.full_name || 'Anonymous'}</span>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-xl">Service Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><h3 className="font-semibold text-gray-700">Description</h3><p className="text-gray-800 whitespace-pre-wrap">{rfs.description}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><h4 className="text-sm font-medium text-gray-500">Budget</h4><p className="text-2xl font-bold text-accent-orange">{formatCurrency(rfs.budget)}</p></div>
              <div><h4 className="text-sm font-medium text-gray-500">Category</h4><p className="text-gray-800">{rfs.category?.name || 'Uncategorized'}</p></div>
              <div><h4 className="text-sm font-medium text-gray-500">Division</h4><p className="text-gray-800">{rfs.division}</p></div>
              <div><h4 className="text-sm font-medium text-gray-500">Parish</h4><p className="text-gray-800">{rfs.parish}</p></div>
            </div>
            {rfs.images && rfs.images.length > 0 && (
              <div><h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {rfs.images.map((url: string, idx: number) => (
                    <img key={idx} src={url} alt={`${rfs.title} - ${idx + 1}`} className="w-full h-40 object-cover rounded-lg border hover:shadow-md" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="bg-accent-orange hover:bg-opacity-90">Submit Proposal</Button>
          <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white">Contact on WhatsApp</Button>
          <Button variant="outline">Share</Button>
        </div>
      </div>
    </>
  )
}
