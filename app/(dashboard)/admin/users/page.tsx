'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  created_at: string
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Users</h1>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No users found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{user.full_name || 'Unnamed'}</span>
                    <Badge className={
                      user.role === 'ADMIN' ? 'bg-red-500' :
                      user.role === 'SERVICE_PROVIDER' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }>
                      {user.role || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email}
                    {user.phone && <span className="ml-2">📞 {user.phone}</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
