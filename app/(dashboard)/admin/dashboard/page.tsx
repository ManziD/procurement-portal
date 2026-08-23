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
    const fetchStats = async () => {
      try {
        // Get total users (from profiles)
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Get total providers
        const { count: totalProviders } = await supabase
          .from('service_providers')
          .select('*', { count: 'exact', head: true })

        // Get total clients (from clients table, non-auth)
        const { count: totalClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })

        // Get total requests
        const { count: totalRequests } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })

        // Get total bids
        const { count: totalBids } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })

        // Get pending verifications (providers with is_verified = false)
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
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Service Providers',
      value: stats.totalProviders,
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Clients (non-auth)',
      value: stats.totalClients,
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Service Requests',
      value: stats.totalRequests,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Bids',
      value: stats.totalBids,
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>Total platform users: {stats.totalUsers + stats.totalClients} (includes auth & non-auth clients)</p>
      </div>
    </div>
  )
}
