'use client'

import { useEffect, useState } from 'react'
import { browserClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Job = Database['public']['Tables']['jobs']['Row']

interface DashboardStats {
  totalJobs: number
  totalRequests: number
  recentJobs: Job[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalRequests: 0,
    recentJobs: []
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await browserClient.auth.getSession()
        if (!session?.user) return

        const { data, error } = await browserClient.rpc(
          'get_dashboard_stats',
          { p_user_id: session.user.id }
        )

        if (error) throw error

        // Validar e converter o retorno Json
        if (
          typeof data === 'object' && 
          data !== null && 
          'totalJobs' in data && 
          'totalRequests' in data && 
          'recentJobs' in data &&
          Array.isArray(data.recentJobs)
        ) {
          setStats(data as unknown as DashboardStats)
        } else {
          throw new Error('Formato de dados inválido')
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do dashboard",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [toast])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total de Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalJobs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Requisições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRequests}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vagas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(job.created_at || '').toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-dynamic' 