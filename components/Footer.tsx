import Link from 'next/link'
import { Briefcase, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle, HelpCircle, FileText, Shield, Home } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 text-xl font-bold text-white mb-4">
              <Briefcase className="h-6 w-6 text-accent-orange" />
              <span>Service<span className="text-accent-orange">Hub</span></span>
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
              <li><Link href="/about" className="hover:text-accent-orange transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-accent-orange transition-colors flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Chat with Us</a></li>
              <li><a href="#" className="hover:text-accent-orange transition-colors flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Help Center</a></li>
              <li><a href="#" className="hover:text-accent-orange transition-colors flex items-center gap-2"><FileText className="h-4 w-4" /> Contact Us</a></li>
              <li><a href="#" className="hover:text-accent-orange transition-colors flex items-center gap-2"><Shield className="h-4 w-4" /> Terms &amp; Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-accent-orange" />
                <span>
                  <span className="font-medium">ServiceHub UG</span><br />
                  Bweyogerere, Kampala, Uganda
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-accent-orange" />
                <div className="flex flex-col">
                  <a href="https://wa.me/256750349712" target="_blank" rel="noopener noreferrer" className="hover:text-accent-orange transition-colors">
                    0750 349 712
                  </a>
                  <a href="https://wa.me/256771206810" target="_blank" rel="noopener noreferrer" className="hover:text-accent-orange transition-colors">
                    0771 206 810
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-accent-orange" />
                <a href="mailto:info@servicehub-ug.com" className="hover:text-accent-orange transition-colors">
                  info@servicehub-ug.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Second row: additional links */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <a href="#" className="hover:text-accent-orange transition-colors">Report a Service</a>
            <a href="#" className="hover:text-accent-orange transition-colors">Return &amp; Refund Policy</a>
            <a href="#" className="hover:text-accent-orange transition-colors">Privacy Policy Notice</a>
            <a href="#" className="hover:text-accent-orange transition-colors">Cookie Notice</a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ServiceHub-Ug. All rights reserved. Built for Kampala, Uganda.</p>
        </div>
      </div>
    </footer>
  )
}
