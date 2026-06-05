import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'YipitData KPI Dashboard',
  description: 'Real-time brand and retailer performance indicators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-900">YipitData KPI Dashboard</h1>
            <div className="flex gap-4">
               {/* Simple Auth Placeholder */}
               <span className="text-sm text-slate-500">Welcome, Stakeholder</span>
            </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
