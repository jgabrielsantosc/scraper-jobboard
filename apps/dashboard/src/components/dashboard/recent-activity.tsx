import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Activity {
  id: number
  description: string
  timestamp: Date
  status: "success" | "pending" | "error"
}

const activities: Activity[] = [
  {
    id: 1,
    description: "Coleta de vagas em gupy.io",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    status: "success"
  },
  {
    id: 2,
    description: "Atualização de vagas existentes",
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    status: "pending"
  },
  {
    id: 3,
    description: "Tentativa de coleta falhou",
    timestamp: new Date(Date.now() - 6 * 60 * 1000),
    status: "error"
  }
]

const formatTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

const getStatusColor = (status: Activity["status"]): string => {
  const colors = {
    success: "text-green-500",
    pending: "text-yellow-500",
    error: "text-red-500"
  }
  return colors[status]
}

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number
}

export function RecentActivity({ className, limit = 5, ...props }: RecentActivityProps) {
  const displayedActivities = activities.slice(0, limit)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
        <Badge variant="outline" className="font-mono">
          {activities.length} atividades
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
                <Badge 
                  variant={
                    activity.status === "success" 
                      ? "default"
                      : activity.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  className={getStatusColor(activity.status)}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 