import AuthGuard from '@/components/AuthGuard'

async function ClientDashboardContent() {
  // your existing client dashboard content
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-blue">Client Dashboard</h1>
      {/* your content */}
    </div>
  )
}

export default function ClientDashboardPage() {
  return (
    <AuthGuard requiredRole="CLIENT">
      <ClientDashboardContent />
    </AuthGuard>
  )
}
