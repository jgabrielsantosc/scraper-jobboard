import { UserNav } from "./user-nav"
import { MobileSidebar } from "./mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-14 items-center px-4">
        <MobileSidebar />
        
        <div className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <form className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-8 h-9 w-[200px] lg:w-[300px] rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-900 transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </form>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              Ajuda
            </Button>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
} 