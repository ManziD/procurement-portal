import { Metadata } from 'next'
import AboutHero from '@/components/AboutHero'

export const metadata: Metadata = {
  title: 'About ServiceHub-Ug – Connecting Kampala to Trusted Services',
  description: 'Learn about ServiceHub-Ug, the leading platform connecting businesses and individuals with trusted service providers in Kampala, Uganda.',
  openGraph: {
    title: 'About ServiceHub-Ug – Connecting Kampala to Trusted Services',
    description: 'We help clients find reliable service providers and help professionals grow their businesses in Kampala.',
    url: 'https://ServiceHub-Ug.com/about',
    siteName: 'ServiceHub-Ug',
    locale: 'en_UG',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Organization Schema – tells Google this is the official business page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ServiceHub-Ug",
            "description": "Connecting clients with trusted service providers in Kampala, Uganda.",
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
            },
            "founder": [
              {
                "@type": "Person",
                "name": "Atukumiire Locus Katureebe"
              },
              {
                "@type": "Person",
                "name": "Manzi Delick"
              }
            ],
            "foundingDate": "2024"
          })
        }}
      />

      <AboutHero />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-xl font-semibold text-gray-700 mb-8">
          Connecting You to the Services You Need
        </p>

        <div className="prose prose-lg max-w-none">
          <p>
            At <strong>ServiceHub-Ug</strong>, we are making it easier for people to find reliable service providers and for skilled professionals to connect with customers who need their services.
          </p>

          <p>
            We are a digital marketplace built to bring <strong>clients and service providers together in one simple, convenient platform</strong>. Instead of relying solely on personal referrals, social media posts, or lengthy searches, clients can use ServiceHub-Ug to discover, compare, and connect with service providers based on factors such as location, ratings, price, and availability.
          </p>

          <p>
            For service providers, ServiceHub-Ug creates an opportunity to build a professional presence, showcase their skills and experience, reach new customers, and grow their businesses.
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Why ServiceHub-Ug?</h2>

          <p>
            Finding the right person for a job should not be difficult.
          </p>

          <p>
            Every day, individuals, households, professionals, and businesses need services—from home repairs and professional consultancy to beauty and wellness, events, automotive services, and electronic repairs. At the same time, many capable service providers are looking for more opportunities to reach customers.
          </p>

          <p>
            <strong>ServiceHub-Ug bridges this gap.</strong>
          </p>

          <p>
            Our platform is designed around four principles:
          </p>

          <p className="font-semibold text-primary-blue">
            Speed. Reliability. Verification. Flexibility.
          </p>

          <p>
            We want customers to find the help they need quickly, while giving service providers a reliable platform through which they can connect with potential clients.
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">What We Offer</h2>

          <p>
            ServiceHub-Ug brings together a wide range of service categories, including:
          </p>

          <ul className="list-disc pl-6 space-y-1">
            <li>Home and property services</li>
            <li>Professional and business services</li>
            <li>Personal, beauty and wellness services</li>
            <li>Events and entertainment</li>
            <li>Automotive and mobility services</li>
            <li>Appliance and electronic repair</li>
            <li>Consultancy and other professional services</li>
          </ul>

          <p>
            Clients can browse available providers or post a request, while providers can create profiles, showcase their credentials and portfolios, indicate their availability, and respond to service requests.
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Building a Marketplace You Can Trust</h2>

          <p>
            Trust is central to everything we do.
          </p>

          <p>
            Choosing someone to provide a service—whether for your home, business, vehicle, event, or personal needs—requires confidence. ServiceHub-Ug is therefore designed to incorporate <strong>provider verification, ratings, quality control, and clear processes</strong> to help customers make more informed choices.
          </p>

          <p>
            Our goal is not simply to help you find a provider. <strong>It is to help you find the right provider with greater confidence.</strong>
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Creating Opportunities</h2>

          <p>
            ServiceHub-Ug is also built with service providers in mind.
          </p>

          <p>
            Independent professionals, consultants, freelancers, skilled tradespeople, small businesses, and other service providers can use the platform to showcase what they do and connect with customers beyond their existing networks.
          </p>

          <p>
            We believe that when talented people have better access to customers, they have more opportunities to grow.
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Built for Uganda</h2>

          <p>
            ServiceHub-Ug is starting in Uganda, with an understanding of how people here search for and access services.
          </p>

          <p>
            Our platform is designed to be <strong>mobile-first, simple, flexible, and suitable for everyday internet and mobile usage</strong>. We are starting with Uganda and intend to grow into more cities and, eventually, selected markets beyond the country.
          </p>

          <p>
            Our ambition is to build a platform that becomes a trusted destination whenever someone asks:
          </p>

          <blockquote className="border-l-4 border-primary-blue pl-4 italic text-gray-700">
            "Where can I find someone who can do this?"
          </blockquote>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Our Mission</h2>

          <blockquote className="border-l-4 border-primary-blue pl-4 text-gray-700">
            <strong>To bridge the gap between customers and service providers in Uganda by delivering a fast, reliable, and flexible digital platform that builds trust, creates economic opportunity, and scales to international markets.</strong>
          </blockquote>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Our Vision</h2>

          <blockquote className="border-l-4 border-primary-blue pl-4 text-gray-700">
            <strong>To become the most trusted platform connecting clients and service providers across Uganda and beyond, making quality services accessible, fast, and reliable for everyone.</strong>
          </blockquote>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Who We Are</h2>

          <p>
            ServiceHub-Ug was founded by <strong>Atukumiire Locus Katureebe</strong> and <strong>Manzi Delick</strong>, with a shared goal of creating a practical digital solution to the challenge of finding reliable services.
          </p>

          <p>
            We started with a focused approach: build a useful platform, establish trust between clients and providers, listen to our users, and continuously improve the experience.
          </p>

          <p>
            Our long-term goal is to grow from a Ugandan marketplace into a platform with a wider East African and international reach.
          </p>

          <h2 className="text-2xl font-semibold text-primary-blue mt-8">Our Promise</h2>

          <p>
            At <strong>ServiceHub-Ug</strong>, we are building more than a directory of service providers.
          </p>

          <p>
            We are building a <strong>trusted connection between people who need services and people who provide them.</strong>
          </p>

          <div className="bg-primary-blue/5 p-6 rounded-lg mt-8 text-center">
            <p className="text-xl font-semibold text-primary-blue">
              Find a service. Find an opportunity. Connect with confidence.
            </p>
            <p className="text-lg text-gray-700 mt-2">
              <strong>ServiceHub-Ug</strong> — Connecting clients with service providers.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
