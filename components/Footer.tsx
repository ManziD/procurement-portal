import Link from 'next/link'
import { Briefcase, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 text-xl font-bold text-white mb-4">
              <Briefcase className="h-6 w-6 text-accent-orange" />
              <span>Procure<span className="text-accent-orange">UG</span></span>
            </div>
            <p className="text-sm">
              Connecting businesses with verified service providers in Kampala, Uganda.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-accent-orange transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent-orange transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent-orange transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-accent-orange transition-colors">Browse Services</Link></li>
              <li><Link href="/register" className="hover:text-accent-orange transition-colors">Register</Link></li>
              <li><Link href="/login" className="hover:text-accent-orange transition-colors">Login</Link></li>
              <li><Link href="#" className="hover:text-accent-orange transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/client/post-rfs" className="hover:text-accent-orange transition-colors">Post a Request</Link></li>
              <li><Link href="/client/dashboard" className="hover:text-accent-orange transition-colors">My Requests</Link></li>
              <li><Link href="/browse" className="hover:text-accent-orange transition-colors">Find Providers</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-accent-orange" />
                <span>Kampala, Uganda</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-accent-orange" />
                <span>+256 700 000 000</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-accent-orange" />
                <span>info@procureug.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ProcureUG. All rights reserved. Built for Kampala, Uganda.</p>
        </div>
      </div>
    </footer>
  )
}
