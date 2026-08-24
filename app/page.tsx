import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import HeroBanner from '@/components/HeroBanner'
import CategoryCard from '@/components/CategoryCard'
import ServiceCard from '@/components/ServiceCard'
import { CATEGORIES } from '@/lib/constants'

// Sample featured services – replace with real data later
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
]

export default function Home() {
  return (
    <>
      {/* Organization Schema – JSON‑LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ServiceHub-Ug",
            "description": "Connecting businesses with trusted service providers in Kampala, Uganda.",
            "url": "https://ServiceHub-Ug.com",
            "logo": "https://ServiceHub-Ug.com/logo.png",
            "email": "info@servicehub-ug.com",
            "telephone": "+256-750-349-712",
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+256-750-349-712",
                "contactType": "Customer Service"
              },
              {
                "@type": "ContactPoint",
                "telephone": "+256-740-339-768",
                "contactType": "Sales"
              }
            ],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kampala",
              "addressCountry": "UG"
            }
          })
        }}
      />

      <div>
        <HeroBanner />

        {/* Quick Action: Post a Request */}
        <section className="container mx-auto px-4 py-6">
          <div className="bg-primary-blue/10 rounded-xl p-6 text-center border-2 border-dashed border-primary-blue">
            <h2 className="text-xl font-semibold text-primary-blue">Need a service?</h2>
            <p className="text-gray-600 text-sm mt-1">Post a request and get bids from trusted providers</p>
            <Link href="/browse">
              <Button className="mt-3 bg-accent-orange hover:bg-opacity-90 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post a Request
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-primary-blue mb-6">
            Browse Services by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Services */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary-blue">
                Featured Services
              </h2>
              <a href="/browse" className="text-accent-orange hover:underline font-medium">
                View All →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
