import { Metadata } from 'next'
import AboutHero from '@/components/AboutHero'
import Reveal from '@/components/Reveal'

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
            Choosing someone to provide a service—whether for your home, business, event, or personal needs—requires confidence. ServiceHub-Ug is therefore designed to incorporate <strong>provider verification, ratings, and clear processes</strong> to help customers make more informed choices.
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

          {/* ============================================================
              WHO WE ARE — restructured. Every word below is unchanged
              from the original three paragraphs; only the layout differs:
              - the two founder names are pulled into cards instead of
                sitting bolded mid-sentence
              - "build a useful platform, establish trust between clients
                and providers, listen to our users, and continuously
                improve the experience" was already four comma-joined
                phrases, now shown as a list of those same four phrases
              Wrapped in not-prose so Tailwind Typography's default
              heading/paragraph/list styles don't override the custom
              classes below.
             ============================================================ */}
          <div className="not-prose mt-8">
            <Reveal>
              <h2 className="text-2xl font-semibold text-primary-blue">Who We Are</h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-4 text-gray-700 leading-relaxed">
                ServiceHub-Ug was founded by <strong>Atukumiire Locus Katureebe</strong> and <strong>Manzi Delick</strong>, with a shared goal of creating a practical digital solution to the challenge of finding reliable services.
              </p>
            </Reveal>

            <div className="mt-5 flex flex-wrap gap-4">
              <Reveal delay={0.14}>
                <div className="flex items-center gap-3 rounded-2xl border border-primary-blue/10 bg-primary-blue/5 px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-blue text-sm font-bold text-white">
                    ALK
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Atukumiire Locus Katureebe
                    </div>
                    <div className="text-xs text-gray-500">Co-Founder</div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="flex items-center gap-3 rounded-2xl border border-primary-blue/10 bg-primary-blue/5 px-5 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-orange text-sm font-bold text-white">
                    MD
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Manzi Delick
                    </div>
                    <div className="text-xs text-gray-500">Co-Founder</div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent-orange">
                We started with a focused approach
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  'Build a useful platform',
                  'Establish trust between clients and providers',
                  'Listen to our users',
                  'Continuously improve the experience',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-orange" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 text-gray-700 leading-relaxed">
                Our long-term goal is to grow from a Ugandan marketplace into a platform with a wider East African and international reach.
              </p>
            </Reveal>
          </div>

          {/* ============================================================
              OUR PROMISE — same structure and text as the original,
              just wrapped in Reveal for the scroll-in effect. The
              highlighted box below was already a distinct visual
              element, so nothing else was restructured here.
             ============================================================ */}
          <div className="not-prose mt-8">
            <Reveal>
              <h2 className="text-2xl font-semibold text-primary-blue">Our Promise</h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-4 text-gray-700 leading-relaxed">
                At <strong>ServiceHub-Ug</strong>, we are building more than a directory of service providers.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We are building a <strong>trusted connection between people who need services and people who provide them.</strong>
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="bg-primary-blue/5 p-6 rounded-lg mt-8 text-center">
                <p className="text-xl font-semibold text-primary-blue">
                  Find a service. Find an opportunity. Connect with confidence.
                </p>
                <p className="text-lg text-gray-700 mt-2">
                  <strong>ServiceHub-Ug</strong> — Connecting clients with service providers.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}
