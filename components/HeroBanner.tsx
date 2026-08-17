'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { ArrowRight, Briefcase, Users, CheckCircle } from 'lucide-react'

export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-primary-blue to-secondary-blue text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find the Best <br />
              <span className="text-accent-orange">Business Services</span> in Kampala
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-6">
              Connect with verified service providers for your business needs.
              Post requests, get proposals, and grow your business.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button className="bg-accent-orange hover:bg-opacity-90 text-white text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-blue text-lg px-8 py-6">
                  Browse Services
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-accent-orange mr-2" />
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-accent-orange mr-2" />
                <span>500+ Businesses</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-accent-orange mr-2" />
                <span>1000+ Jobs Posted</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🔧', label: 'Plumbing' },
                  { icon: '⚡', label: 'Electrical' },
                  { icon: '💻', label: 'Web Design' },
                  { icon: '🧹', label: 'Cleaning' },
                  { icon: '🍳', label: 'Catering' },
                  { icon: '📸', label: 'Photography' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Shape */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  )
}
