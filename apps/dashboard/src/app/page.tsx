import { PublicHeader } from "@/components/public-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-32 md:pb-12 md:pt-40 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Automatize a coleta de vagas de emprego
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Conecte-se aos principais job boards e extraia dados de vagas em segundos com a nossa API e Dashboard avançados.
            </p>
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button size="lg">Acessar Dashboard</Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" size="lg">
                  Testar API
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Múltiplos Job Boards</h3>
                  <p className="text-sm text-muted-foreground">
                    Suporte para mais de 20 plataformas de vagas diferentes.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">API Simples</h3>
                  <p className="text-sm text-muted-foreground">
                    Integração fácil com documentação completa.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Dashboard Intuitivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas coletas e visualize estatísticas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
