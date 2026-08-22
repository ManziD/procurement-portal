'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Lock, 
  Briefcase, 
  FileText, 
  Inbox, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle
} from 'lucide-react'

export default function PortalPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [providerData, setProviderData] = useState<any>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  
  // Client requests
  const [clientRequests, setClientRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Check session and load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)

      if (profileData?.role === 'SERVICE_PROVIDER') {
        const { data: provider } = await supabase
          .from('service_providers')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProviderData(provider)

        const { data: invData } = await supabase
          .from('invitations')
          .select(`
            id,
            status,
            created_at,
            request:service_requests (
              id,
              title,
              location,
              division,
              parish,
              timeline
            )
          `)
          .eq('provider_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setInvitations(invData || [])

        const { data: bidData } = await supabase
          .from('bids')
          .select(`
            id,
            price,
            timeline,
            status,
            created_at,
            request:service_requests (
              id,
              title,
              location
            )
          `)
          .eq('provider_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setBids(bidData || [])
      }

      if (profileData?.role === 'CLIENT') {
        const { data: requests } = await supabase
          .from('service_requests')
          .select(`
            id,
            title,
            description,
            location,
            division,
            parish,
            status,
            created_at,
            timeline,
            tracking_token
          `)
          .eq('profile_id', session.user.id)
          .order('created_at', { ascending: false })

        setClientRequests(requests || [])
        setLoadingRequests(false)
      }

      setLoading(false)
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadData()
      } else {
        setUser(null)
        setProfile(null)
        setProviderData(null)
        setInvitations([])
        setBids([])
        setClientRequests([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setLoginError(err.message)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, className: string }> = {
      'PENDING': { label: 'Pending', className: 'bg-yellow-500' },
      'VIEWED': { label: 'Viewed', className: 'bg-blue-500' },
      'BID_SUBMITTED': { label: 'Bid Sent', className: 'bg-green-500' },
      'DECLINED': { label: 'Declined', className: 'bg-gray-500' },
      'ACCEPTED': { label: 'Accepted', className: 'bg-green-600' },
      'REJECTED': { label: 'Rejected', className: 'bg-red-500' },
      'WITHDRAWN': { label: 'Withdrawn', className: 'bg-gray-400' },
    }
    return map[status] || { label: status, className: 'bg-gray-500' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'BID_SUBMITTED': return <CheckCircle className="h-4 w-4" />
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'DECLINED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // --- NOT LOGGED IN: Show login form ---
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-primary-blue text-center">Welcome Back</CardTitle>
            <p className="text-center text-gray-600 text-sm">Sign in to your ServiceHub-UG account</p>
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
              {loginError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {loginError}
                </div>
              )}
              <Button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-primary-blue hover:bg-primary-dark"
              >
                {loggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-center text-sm mt-4">
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

  // --- CLIENT DASHBOARD ---
  if (profile?.role === 'CLIENT') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-blue">
              Welcome, {profile.full_name || 'Client'}
            </h1>
            <p className="text-gray-600 text-sm">Client Dashboard</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/client/request">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-primary-blue/30 hover:border-primary-blue">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold">Post a Request</h3>
                <p className="text-sm text-gray-500 mt-1">Get help from trusted service providers</p>
                <Button className="mt-4 bg-accent-orange hover:bg-opacity-90 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Request
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold">My Requests</h3>
                <p className="text-sm text-gray-500 mt-1">Track your service requests</p>
                {!loadingRequests && (
                  <p className="text-2xl font-bold text-primary-blue mt-2">{clientRequests.length}</p>
                )}
              </div>
              {!loadingRequests && clientRequests.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {clientRequests.slice(0, 5).map((req) => (
                    <Link
                      key={req.id}
                      href={`/track/${req.tracking_token}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-3 hover:shadow-md transition-shadow text-sm">
                        <div className="font-medium truncate">{req.title}</div>
                        <div className="text-gray-500 text-xs flex justify-between mt-1">
                          <span>{req.location}</span>
                          <Badge className={req.status === 'OPEN' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {req.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {!loadingRequests && clientRequests.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-2">
                  No requests yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // --- PROVIDER DASHBOARD ---
  if (profile?.role === 'SERVICE_PROVIDER') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-blue">
              Welcome, {providerData?.business_name || profile.full_name || 'Provider'}
            </h1>
            <p className="text-gray-600 text-sm">Provider Dashboard</p>
            {providerData?.is_premium && (
              <Badge className="bg-accent-orange text-white mt-1">Premium</Badge>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        {/* === PROFILE COMPLETION BANNER === */}
        {providerData && (!providerData.services_offered?.length || !providerData.serves_locations?.length) && (
          <Card className="mb-6 border-yellow-400 bg-yellow-50">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-700">Complete your profile</p>
                <p className="text-sm text-yellow-600">Add your services and service areas to start receiving requests.</p>
              </div>
              <Link href="/provider/profile">
                <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Invitations</p>
                  <p className="text-2xl font-bold">{invitations.length}</p>
                </div>
                <Inbox className="h-8 w-8 text-primary-blue opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Invitations</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {invitations.filter(i => i.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bids Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{bids.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invitations */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary-blue">Recent Invitations</h2>
            <Link href="/provider/inbox" className="text-sm text-accent-orange hover:underline">
              View All →
            </Link>
          </div>
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                No invitations yet. When clients invite you, they'll appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => {
                const request = inv.request as any
                const statusInfo = getStatusBadge(inv.status)
                return (
                  <Link
                    key={inv.id}
                    href={`/provider/inbox/${request?.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary-blue">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">
                              {request?.title || 'Untitled Request'}
                            </span>
                            <Badge className={statusInfo.className}>
                              {getStatusIcon(inv.status)}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {request?.location || 'Unknown location'} • {request?.timeline || 'No timeline'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 ml-4 flex-shrink-0">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Bids */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary-blue">My Bids</h2>
            <Link href="/provider/bids" className="text-sm text-accent-orange hover:underline">
              View All →
            </Link>
          </div>
          {bids.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                You haven't submitted any bids yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => {
                const request = bid.request as any
                const statusInfo = getStatusBadge(bid.status)
                return (
                  <Link
                    key={bid.id}
                    href={`/provider/inbox/${request?.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-accent-orange">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">
                              {request?.title || 'Untitled Request'}
                            </span>
                            <Badge className={statusInfo.className}>
                              {getStatusIcon(bid.status)}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            UGX {bid.price?.toLocaleString()} • {bid.timeline}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 ml-4 flex-shrink-0">
                          {new Date(bid.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- FALLBACK: Unknown role ---
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Your role is not recognized. Please contact support.</p>
        <Button onClick={handleLogout} variant="outline" className="mt-4">
          Logout
        </Button>
      </div>
    </div>
  )
}
