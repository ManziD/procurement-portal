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
  
  const [clientRequests, setClientRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

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

        // 🔥 Simplified: use the view
        const { data: invData } = await supabase
          .from('provider_inbox_view')
          .select('*')
          .eq('provider_id', session.user.id)
          .order('invited_at', { ascending: false })
          .limit(5)

        setInvitations(invData || [])

        // Bids query stays the same (bids table)
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

  // ... (login/logout handlers and getStatusBadge functions remain unchanged)

  // The rest of the file (render functions for client and provider dashboards) remains the same,
  // but we need to update the invitation mapping because the column names changed.
  // In the provider dashboard, when mapping invitations, change:
  // - inv.request.title → inv.request_title
  // - inv.request.location → inv.location
  // - inv.request.timeline → inv.timeline
  // - inv.status → inv.invitation_status
  // - inv.created_at → inv.invited_at

  // I'll show the updated provider dashboard section below.
