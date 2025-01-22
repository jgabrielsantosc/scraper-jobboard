import Link from "next/link"
import { Button } from "./ui/button"

export function PublicHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">Job Scraper</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/playground"
              className="transition-colors hover:text-foreground/80"
            >
              Playground
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground/80"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground/80"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80"
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 