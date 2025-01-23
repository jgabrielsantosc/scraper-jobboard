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
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Job Scraper
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 