'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, FileText, DollarSign, UserCheck, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalClients: 0,
    totalRequests: 0,
    totalBids: 0,
    pendingVerifications: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        // 1. Total users (profiles)
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // 2. Total providers (service_providers)
        const { count: totalProviders } = await supabase
          .from('service_providers')
          .select('*', { count: 'exact', head: true })

        // 3. Total clients (clients table)
        const { count: totalClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })

        // 4. Total service requests
        const { count: totalRequests } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })

        // 5. Total bids
        const { count: totalBids } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })

        // 6. Pending verifications (providers not verified)
        const { count: pendingVerifications } = await supabase
          .from('service_providers')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', false)

        setStats({
          totalUsers: totalUsers || 0,
          totalProviders: totalProviders || 0,
          totalClients: totalClients || 0,
          totalRequests: totalRequests || 0,
          totalBids: totalBids || 0,
          pendingVerifications: pendingVerifications || 0,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading stats...</div>
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Providers', value: stats.totalProviders, icon: Briefcase, color: 'bg-green-500' },
    { title: 'Clients', value: stats.totalClients, icon: UserCheck, color: 'bg-purple-500' },
    { title: 'Requests', value: stats.totalRequests, icon: FileText, color: 'bg-yellow-500' },
    { title: 'Bids', value: stats.totalBids, icon: DollarSign, color: 'bg-indigo-500' },
    { title: 'Pending Verifications', value: stats.pendingVerifications, icon: Clock, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-blue mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          ⚠️ You have {stats.pendingVerifications} provider{stats.pendingVerifications !== 1 ? 's' : ''} pending verification.
          <a href="/admin/providers" className="ml-2 text-primary-blue hover:underline">Review now</a>
        </p>
      </div>
    </div>
  )
}
