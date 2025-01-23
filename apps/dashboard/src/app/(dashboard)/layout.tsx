'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { browserClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await browserClient.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setIsMounted(true)
    }

    checkAuth()
  }, [router])

  if (!isMounted) {
    return null // ou um loading spinner
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="py-8">
          <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 