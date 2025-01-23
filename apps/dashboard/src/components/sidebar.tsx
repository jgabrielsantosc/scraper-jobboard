"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  PlayCircle,
  FileText,
  Activity,
  Key,
  Settings,
  Plug,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Playground",
    icon: PlayCircle,
    href: "/playground",
    color: "text-violet-500",
  },
  {
    label: "Documentação",
    icon: FileText,
    color: "text-pink-700",
    href: "/docs",
  },
  {
    label: "Activity Logs",
    icon: Activity,
    color: "text-orange-700",
    href: "/activity",
  },
  {
    label: "API Keys",
    icon: Key,
    color: "text-emerald-500",
    href: "/api-keys",
  },
  {
    label: "Integrações",
    icon: Plug,
    color: "text-blue-500",
    href: "/integrations",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-gray-50 overflow-y-auto border-r border-gray-200">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 truncate">Job Scraper</h1>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="flex-1 px-3 space-y-0.5">
            {routes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-gray-100",
                    isActive 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <route.icon className={cn("h-5 w-5 mr-3 transition-colors", 
                    isActive ? route.color : "text-gray-400"
                  )} />
                  <span className="truncate">{route.label}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
} 