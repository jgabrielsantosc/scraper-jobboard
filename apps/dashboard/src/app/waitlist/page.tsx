import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function WaitlistPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Entre na Waitlist</h1>
          <p className="mt-2 text-muted-foreground">
            Seja o primeiro a saber quando o Job Scraper estiver disponível.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Seu melhor email"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              Entrar na Waitlist
            </Button>
          </div>
        </form>

        <div className="text-sm">
          <Link href="/" className="text-primary hover:text-primary/90">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
} 