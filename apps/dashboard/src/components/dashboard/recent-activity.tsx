import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecentActivity({ className, ...props }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Coleta de vagas em gupy.io
                </p>
                <p className="text-sm text-muted-foreground">
                  há {i * 2} minutos
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 