'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { createClient } from "@/lib/supabase/client"
import { routeConfig } from '@/app/config'

interface DashboardStats {
  totalRequests: number
  totalJobs: number
  requestsGrowth: number
  jobsGrowth: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalJobs: 0,
    requestsGrowth: 0,
    jobsGrowth: 0
  })
  
  useEffect(() => {
    const supabase = createClient()
    
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Buscar total de requisições (api_logs)
      const { count: totalRequests } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Buscar total de vagas
      const { count: totalJobs } = await supabase
        .from('job')
        .select('*', { count: 'exact' })

      // Calcular crescimento (exemplo simplificado)
      // Em um caso real, você precisaria comparar com o mês anterior
      const requestsGrowth = 20.1
      const jobsGrowth = 10.5

      setStats({
        totalRequests: totalRequests || 0,
        totalJobs: totalJobs || 0,
        requestsGrowth,
        jobsGrowth
      })
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.requestsGrowth}% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vagas Coletadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.jobsGrowth}% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Overview className="col-span-4 shadow-sm" />
        <RecentActivity className="col-span-3 shadow-sm" />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = routeConfig.revalidate 