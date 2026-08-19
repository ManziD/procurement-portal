'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, getCurrentProfile } from '@/lib/supabase/client'
import {
  Search,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileText,
  Home,
  Info,
  LogIn,
  UserPlus,
} from 'lucide-react'
import LocationDropdown from './LocationDropdown'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getCurrentProfile().then(setProfile)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getCurrentProfile().then(setProfile)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const getDashboardLink = () => {
    if (!profile) return '/login'
    switch (profile.role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'CLIENT': return '/client/dashboard'
      case 'SERVICE_PROVIDER': return '/provider/dashboard'
      default: return '/login'
    }
  }

  // Define quicklinks for mobile menu
  const quickLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse Services', href: '/browse', icon: Search },
    { name: 'About Us', href: '/about', icon: Info },
  ]

  return (
    <nav className="bg-primary-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Briefcase className="h-6 w-6" />
            <span>Service<span className="text-accent-orange">Hub</span></span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-accent-orange rounded-r-lg hover:bg-opacity-90 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <LocationDropdown />
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href={getDashboardLink()}>
                  <Button variant="secondary" className="bg-white text-primary-blue hover:bg-gray-100">
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm hover:text-accent-orange transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="secondary" className="bg-white text-primary-blue hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-accent-orange hover:bg-opacity-90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-primary-dark rounded-lg"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-accent-orange rounded-r-lg hover:bg-opacity-90 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-primary-light/20">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Quick links */}
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}

            {/* User-specific links */}
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                {profile?.role === 'CLIENT' && (
                  <Link
                    href="/client/post-rfs"
                    className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Post Request</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
