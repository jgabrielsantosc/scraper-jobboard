'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        router.push('/login')
      }
    }

    checkAuth()

    // Adiciona listener para mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isMounted, router, supabase.auth])

  if (!isMounted) {
    return null // ou um loading state
  }

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