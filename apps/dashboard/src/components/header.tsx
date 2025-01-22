import { UserNav } from "./user-nav"
import { MobileSidebar } from "./mobile-sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center px-4 md:px-6">
        <MobileSidebar />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  )
} 