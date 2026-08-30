import Link from 'next/link'

export default function Footer() {
  const whatsappUrl = 'https://wa.me/256750349712'

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        {/* Links Row 1 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link href="/faq" className="hover:text-accent-orange transition-colors">FAQ</Link>
          <span className="text-gray-600">|</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-orange transition-colors"
          >
            CHAT WITH US
          </a>
          <span className="text-gray-600">|</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-orange transition-colors"
          >
            HELP CENTER
          </a>
          <span className="text-gray-600">|</span>
          <Link href="/terms" className="hover:text-accent-orange transition-colors">TERMS &amp; CONDITIONS</Link>
        </div>

        {/* Links Row 2 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm mt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-orange transition-colors"
          >
            REPORT A SERVICE
          </a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-accent-orange transition-colors">
            PRIVACY NOTICE
          </a>
        </div>

        {/* Contact Info – left‑aligned everywhere */}
        <div className="mt-6 text-sm space-y-1 text-left">
          <p>
            <span className="font-medium text-white">Business Name</span>{' '}
            <span className="text-gray-300">ServiceHub Ug</span>
          </p>
          <p>
            <span className="font-medium text-white">Address</span>{' '}
            <span className="text-gray-300">Bweyogerere, Kampala, Uganda</span>
          </p>
          <p>
            <span className="font-medium text-white">Phone Number</span>{' '}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-accent-orange transition-colors"
            >
              0750 349 712
            </a>
            <span className="text-gray-500 mx-1">,</span>
            <a
              href="https://wa.me/256771206810"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-accent-orange transition-colors"
            >
              0771 206 810
            </a>
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ServiceHub-Ug. All rights reserved.</p>
          <p>Design by Manzi</p>
        </div>
      </div>
    </footer>
  )
}
