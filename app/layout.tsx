import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://procurement-portal-ten.vercel.app'),
  title: 'ServiceHub-Ug – Find Services in Kampala',
  description: 'Connecting businesses with trusted service providers in Kampala, Uganda.',
  openGraph: {
    title: 'ServiceHub-Ug – Find Services in Kampala',
    description: 'Connecting businesses with trusted service providers in Kampala, Uganda.',
    url: '/',
    siteName: 'ServiceHub-Ug',
    locale: 'en_UG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ServiceHub-Ug – Find Services in Kampala',
    description: 'Connecting businesses with trusted service providers in Kampala, Uganda.',
  },
  other: {
    'geo.region': 'UG',
    'geo.placename': 'Kampala',
    'geo.position': '0.3476;32.5825',
    'ICBM': '0.3476, 32.5825',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
