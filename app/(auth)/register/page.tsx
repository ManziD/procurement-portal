'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Briefcase, UserCheck } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'SERVICE_PROVIDER'>('CLIENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Sign up user – no redirectTo
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (authError) throw authError

      // 2. Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
          })

        if (profileError) throw profileError

        // 3. If service provider, create service_provider record
        if (role === 'SERVICE_PROVIDER') {
          const { error: providerError } = await supabase
            .from('service_providers')
            .insert({
              id: authData.user.id,
              business_name: fullName,
            })

          if (providerError) throw providerError
        }

        // Redirect based on role
        if (role === 'CLIENT') {
          router.push('/client/dashboard')
        } else {
          router.push('/provider/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth temporarily disabled to avoid redirect errors
  // const handleGoogleRegister = async () => { ... }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary-blue">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join ServiceHub-Ug to start connecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full"
                icon={<User className="h-4 w-4 text-gray-400" />}
              />
            </div>
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
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
                icon={<Lock className="h-4 w-4 text-gray-400" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    role === 'CLIENT'
                      ? 'border-primary-blue bg-primary-blue/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className="h-5 w-5 mx-auto mb-1 text-primary-blue" />
                  <span className="text-sm font-medium">Hire Services</span>
                  <p className="text-xs text-gray-500">Client</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('SERVICE_PROVIDER')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    role === 'SERVICE_PROVIDER'
                      ? 'border-primary-blue bg-primary-blue/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="h-5 w-5 mx-auto mb-1 text-primary-blue" />
                  <span className="text-sm font-medium">Offer Services</span>
                  <p className="text-xs text-gray-500">Provider</p>
                </button>
              </div>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* Google button removed temporarily */}

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="text-primary-blue hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
