'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { createClient } from "@/lib/supabase/client"
import { routeConfig } from '@/app/config'

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vagas Coletadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground mt-1">
              +10.5% em relação ao mês passado
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

export const dynamic = routeConfig.dynamic
export const revalidate = routeConfig.revalidate 