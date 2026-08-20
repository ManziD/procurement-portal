import { getCurrentUser, getCurrentProfile } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  CreditCard, 
  User, 
  LogOut,
  Bell,
  Briefcase
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'SERVICE_PROVIDER') {
    redirect('/')
  }

  // Get provider profile
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*')
    .eq('id', user.id)
    .single()

  const navLinks = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/provider/invitations', label: 'Invitations', icon: Mail },
    { href: '/provider/bids', label: 'My Bids', icon: FileText },
    { href: '/provider/subscription', label: 'Premium', icon: CreditCard },
    { href: '/provider/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary-blue" />
            <span className="font-bold text-lg">ServiceHub</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {provider?.business_name || 'Provider'}
          </div>
          {provider?.is_premium && (
            <span className="inline-block mt-1 text-xs bg-accent-orange text-white px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <link.icon className="h-5 w-5 text-gray-500" />
              <span>{link.label}</span>
            </Link>
          ))}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden w-full bg-white border-b p-4 flex justify-between items-center">
        <span className="font-bold">ServiceHub</span>
        <button className="p-2">☰</button>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6">
        {children}
      </main>
    </div>
  )
}
