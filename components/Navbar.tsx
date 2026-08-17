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
  MessageSquare,
  Shield,
  Home
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getCurrentProfile().then(setProfile)
      }
    })

    // Listen for auth changes
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

  return (
    <nav className="bg-primary-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Briefcase className="h-6 w-6" />
            <span>Procure<span className="text-accent-orange">UG</span></span>
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

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Location - Desktop */}
            <div className="hidden lg:block">
              <LocationDropdown />
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 hover:bg-primary-dark px-3 py-2 rounded-lg transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-accent-orange text-white">
                      {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 text-gray-800">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-primary-blue font-medium mt-1">
                        {profile?.role?.replace('_', ' ')}
                      </p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>

                    {profile?.role === 'CLIENT' && (
                      <Link
                        href="/client/post-rfs"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        Post Request
                      </Link>
                    )}

                    {profile?.role === 'SERVICE_PROVIDER' && (
                      <Link
                        href="/provider/profile"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Business Profile
                      </Link>
                    )}

                    <Link
                      href="/browse"
                      className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Search className="h-4 w-4 mr-3" />
                      Browse Services
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="secondary" className="bg-white text-primary-blue hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:inline">
                  <Button className="bg-accent-orange hover:bg-opacity-90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-primary-dark rounded-lg"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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
    </nav>
  )
}
