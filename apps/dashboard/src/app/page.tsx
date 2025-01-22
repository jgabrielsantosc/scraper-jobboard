import Link from "next/link";
import { Button } from "./../components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-gradient-to-b from-background to-muted">
        <div className="container max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Automatize a coleta de vagas de emprego com facilidade
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Conecte-se aos principais job boards e extraia dados de vagas em segundos com a nossa API e Dashboard avançados.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/waitlist">
                Entre na Waitlist
              </Link>
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Garanta acesso antecipado ao Job Scraper
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              "Cadastre o job board da sua empresa",
              "Deixe nosso scraper coletar as URLs das vagas disponíveis",
              "Receba os dados das vagas estruturados em um formato padronizado",
              "Configure rotinas automáticas para manter seus dados sempre atualizados"
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <p className="text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principais Funcionalidades */}
      <section className="py-20 px-4">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Principais Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Scraping de Job Boards",
                description: "Extraia todas as URLs de vagas de mais de 20 plataformas suportadas."
              },
              {
                title: "Análise Detalhada de Vagas",
                description: "Transforme URLs em dados estruturados com informações como título, requisitos, localização, benefícios, e mais."
              },
              {
                title: "Dashboard Intuitivo",
                description: "Gerencie empresas, visualize logs, configure rotinas automáticas e analise métricas."
              },
              {
                title: "Automação Completa",
                description: "Configure tarefas recorrentes e otimize seu fluxo de coleta de dados."
              },
              {
                title: "Logs e Monitoramento",
                description: "Acompanhe o status do scraping e identifique possíveis problemas."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-muted">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para revolucionar a forma como você coleta dados de vagas?
          </h2>
          <Button asChild size="lg">
            <Link href="/waitlist">
              Entre na Waitlist
            </Link>
          </Button>
          <p className="mt-4 text-muted-foreground">
            Receba atualizações e seja o primeiro a testar o Job Scraper
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Job Scraper. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/playwright-otv" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
