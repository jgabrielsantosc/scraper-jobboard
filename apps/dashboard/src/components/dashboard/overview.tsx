"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface DataPoint {
  name: string
  total: number
}

const generateData = (months: number): DataPoint[] => {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  return Array.from({ length: months }, (_, i) => ({
    name: monthNames[i],
    total: Math.floor(Math.random() * 5000) + 1000,
  }))
}

interface OverviewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Overview({ className, ...props }: OverviewProps) {
  const [period, setPeriod] = useState("5m")
  const [data, setData] = useState(() => generateData(5))

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    const months = parseInt(value)
    setData(generateData(months))
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Overview</CardTitle>
        <Tabs defaultValue="5" className="w-[200px]" onValueChange={handlePeriodChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="5">5M</TabsTrigger>
            <TabsTrigger value="3">3M</TabsTrigger>
            <TabsTrigger value="1">1M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Requisições à API nos últimos {period === "1" ? "mês" : `${period} meses`}
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar
                  dataKey="total"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 