import Link from 'next/link'
import HeroBanner from '@/components/HeroBanner'
import CategoryCard from '@/components/CategoryCard'
import ServiceCard from '@/components/ServiceCard'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/constants'

// Sample featured services - In production, fetch from database
const featuredServices = [
  {
    id: '1',
    title: 'Office Cleaning Services',
    category: 'Cleaning',
    budget: 150000,
    location: 'Kampala Central',
    division: 'Central',
    provider_name: 'CleanCo Uganda',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'
  },
  {
    id: '2',
    title: 'Web Development for SMEs',
    category: 'Web Design',
    budget: 2500000,
    location: 'Kawempe',
    division: 'Kawempe',
    provider_name: 'TechWise Solutions',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400'
  },
  {
    id: '3',
    title: 'Catering for Corporate Events',
    category: 'Catering',
    budget: 800000,
    location: 'Makindye',
    division: 'Makindye',
    provider_name: 'Taste of Uganda',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400'
  },
]

export default async function Home() {
  return (
    <div>
      {/* Hero Banner - Jumia style */}
      <HeroBanner />

      {/* Category Cards Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary-blue mb-6">
          Browse Services by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-blue">
              Featured Services
            </h2>
            <Link
              href="/browse"
              className="text-accent-orange hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
