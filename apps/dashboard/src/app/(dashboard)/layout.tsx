import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>
      <div className="md:pl-72">
        <Header />
        <main className="p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
} 