'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide navbar AND footer on inbox and tracking pages
  const isInboxPage = pathname?.includes('/inbox') || pathname?.includes('/track')

  return (
    <div className="min-h-screen flex flex-col">
      {!isInboxPage && <Navbar />}
      <main className={`flex-1 ${isInboxPage ? 'h-screen overflow-hidden' : ''}`}>
        {children}
      </main>
      {!isInboxPage && <Footer />}
    </div>
  )
}
