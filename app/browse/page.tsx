import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import ServiceCard from '@/components/ServiceCard'
import { CATEGORIES, KAMPALA_LOCATIONS } from '@/lib/constants'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; division?: string; page?: string }
}) {
  const category = searchParams.category || 'Services'
  const division = searchParams.division || 'Kampala'
  const page = searchParams.page ? ` - Page ${searchParams.page}` : ''
  return {
    title: `${category} in ${division}, Kampala${page} | ServiceHub-Ug`,
    description: `Find the best ${category.toLowerCase()} service providers in ${division}, Kampala.`,
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; division?: string; page?: string }
}) {
  const categoryFilter = searchParams.category || ''
  const divisionFilter = searchParams.division || ''
  const currentPage = parseInt(searchParams.page || '1', 10)
  const pageSize = 10

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // --- Build base query with filters ---
  let query = supabase
    .from('requests_for_service')
    .select(`
      *,
      category:categories(name),
      client:profiles(full_name)
    `, { count: 'exact' })
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })

  if (categoryFilter) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryFilter)
      .single()
    if (categoryData) query = query.eq('category_id', categoryData.id)
  }

  if (divisionFilter) {
    query = query.eq('division', divisionFilter)
  }

  // --- Get total count and apply pagination ---
  const { count: totalCount } = await query
  const totalPages = Math.ceil((totalCount || 0) / pageSize)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize - 1
  const { data: rfsList } = await query.range(start, end)

  const services = rfsList || []
  const hasResults = services.length > 0

  // --- JSON‑LD: CollectionPage + ItemList ---
  const baseUrl = 'https://ServiceHub-Ug.com'
  const categoryName = categoryFilter || 'Services'
  const divisionName = divisionFilter || 'Kampala'
  const queryParams = new URLSearchParams(searchParams)
  const currentUrl = `${baseUrl}/browse?${queryParams.toString()}`

  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} in ${divisionName}, Kampala${currentPage > 1 ? ` - Page ${currentPage}` : ''}`,
    description: `Find the best ${categoryName.toLowerCase()} service providers in ${divisionName}, Kampala.`,
    url: currentUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: services.map((service, idx) => ({
        '@type': 'ListItem',
        position: (currentPage - 1) * pageSize + idx + 1,
        url: `${baseUrl}/rfs/${service.id}`,
        name: service.title,
      })),
    },
    ...(currentPage > 1 && {
      previousPage: `${baseUrl}/browse?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) }).toString()}`
    }),
    ...(currentPage < totalPages && {
      nextPage: `${baseUrl}/browse?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) }).toString()}`
    }),
  }

  // --- JSON‑LD: BreadcrumbList ---
  const breadcrumbItems = [
    { position: 1, name: 'Home', item: baseUrl },
    { position: 2, name: 'Browse', item: `${baseUrl}/browse` },
  ]
  if (categoryFilter) {
    breadcrumbItems.push({
      position: 3,
      name: categoryFilter,
      item: `${baseUrl}/browse?category=${encodeURIComponent(categoryFilter)}`,
    })
  }
  if (divisionFilter) {
    const pos = categoryFilter ? 4 : 3
    breadcrumbItems.push({
      position: pos,
      name: divisionFilter,
      item: `${baseUrl}/browse?division=${encodeURIComponent(divisionFilter)}`,
    })
  }
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  // --- Helper to build pagination URL ---
  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return `/browse?${params.toString()}`
  }

  return (
    <>
      {/* JSON‑LD scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-blue">Browse Services in Kampala</h1>
          <p className="text-gray-600">Find open requests for services posted by businesses and individuals.</p>
        </div>

        {/* Filter Form */}
        <form method="GET" action="/browse" className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <select
              id="category"
              name="category"
              defaultValue={categoryFilter}
              className="border rounded-md px-3 py-2 bg-white w-48"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="division" className="block text-sm font-medium mb-1">Division</label>
            <select
              id="division"
              name="division"
              defaultValue={divisionFilter}
              className="border rounded-md px-3 py-2 bg-white w-48"
            >
              <option value="">All Divisions</option>
              {Object.keys(KAMPALA_LOCATIONS).map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-primary-blue text-white px-4 py-2 rounded-md hover:bg-primary-dark">
              Apply Filters
            </button>
            {(categoryFilter || divisionFilter) && (
              <a href="/browse" className="ml-2 text-sm text-gray-500 hover:text-primary-blue underline">Clear</a>
            )}
          </div>
        </form>

        {/* Results */}
        {!hasResults ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-700">No services found</h2>
            <p className="text-gray-500 mt-2">
              {categoryFilter || divisionFilter
                ? 'No open requests match your filters. Try adjusting your criteria.'
                : 'There are currently no open service requests. Check back later or post your own request.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => {
                const categoryName = (service.category as any)?.name || 'Uncategorized'
                const clientName = (service.client as any)?.full_name || undefined
                return (
                  <ServiceCard
                    key={service.id}
                    service={{
                      id: service.id,
                      title: service.title,
                      category: categoryName,
                      budget: service.budget,
                      location: service.location,
                      division: service.division,
                      provider_name: clientName,
                      image: service.images?.[0] || undefined,
                      deadline: service.deadline,
                    }}
                  />
                )
              })}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 border-t pt-6">
                <div>
                  {currentPage > 1 && (
                    <a
                      href={buildPaginationUrl(currentPage - 1)}
                      className="px-4 py-2 bg-primary-blue text-white rounded hover:bg-primary-dark"
                    >
                      ← Prev
                    </a>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div>
                  {currentPage < totalPages && (
                    <a
                      href={buildPaginationUrl(currentPage + 1)}
                      className="px-4 py-2 bg-primary-blue text-white rounded hover:bg-primary-dark"
                    >
                      Next →
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
