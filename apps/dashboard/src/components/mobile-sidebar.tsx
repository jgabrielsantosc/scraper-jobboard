"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-gray-400 hover:text-gray-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-72 p-0 bg-gray-900 border-r border-gray-800"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
} 