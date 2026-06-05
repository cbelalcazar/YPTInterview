import { DashboardClient } from '@/components/DashboardClient'

export default function CompanyPage({ params }: { params: { id: string } }) {
  // In a real app, we'd fetch data for this specific company
  // For now, we reuse the dashboard client which shows the Trendy Shoe Brand example
  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</a>
      </div>
      <DashboardClient />
    </div>
  )
}
