'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Chrome } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 1. Attempting login...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true,
        },
      })

      if (error) throw error

      console.log('✅ 2. Login successful. User:', data.user?.email)
      console.log('🔍 3. Session object:', data.session ? 'EXISTS ✅' : 'MISSING ❌')

      // Check localStorage directly
      const token = localStorage.getItem('supabase.auth.token')
      console.log('🔍 4. localStorage token after login:', token ? 'FOUND ✅' : 'MISSING ❌')

      // Check all keys
      const allKeys = Object.keys(localStorage)
      const supabaseKeys = allKeys.filter(k => k.includes('sb-') || k.includes('supabase'))
      console.log('🔍 5. All localStorage keys containing "sb-" or "supabase":', supabaseKeys)

      // Redirect based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (profile?.role === 'CLIENT') {
        router.push('/client/dashboard')
      } else if (profile?.role === 'SERVICE_PROVIDER') {
        router.push('/provider/dashboard')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary-blue">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your ServiceHub-UG account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                icon={<Mail className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                icon={<Lock className="h-4 w-4 text-gray-400" />}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-blue hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/register" className="text-primary-blue hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
