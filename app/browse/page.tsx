import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import ServiceCard from '@/components/ServiceCard'
import { CATEGORIES, KAMPALA_LOCATIONS } from '@/lib/constants'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; division?: string }
}) {
  const category = searchParams.category || 'Services'
  const division = searchParams.division || 'Kampala'
  return {
    title: `${category} in ${division}, Kampala | ServiceHub-Ug`,
    description: `Find the best ${category.toLowerCase()} service providers in ${division}, Kampala. Post your request and get proposals from verified businesses.`,
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; division?: string }
}) {
  const categoryFilter = searchParams.category || ''
  const divisionFilter = searchParams.division || ''

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('requests_for_service')
    .select(`
      *,
      category:categories(name),
      client:profiles(full_name)
    `)
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

  const { data: rfsList } = await query
  const services = rfsList || []
  const hasResults = services.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Browse Services in Kampala</h1>
        <p className="text-gray-600">Find open requests for services posted by businesses and individuals.</p>
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={{
                id: service.id,
                title: service.title,
                category: service.category?.name || 'Uncategorized',
                budget: service.budget,
                location: service.location,
                division: service.division,
                provider_name: service.client?.full_name || undefined,
                image: service.images?.[0] || undefined,
                deadline: service.deadline,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
