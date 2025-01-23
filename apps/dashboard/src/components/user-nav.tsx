"use client"

import { browserClient } from '@/lib/supabase/client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from '@supabase/supabase-js'

interface UserData {
  email: string | undefined
}

const getUserData = async (user: User | null): Promise<UserData> => {
  if (!user) {
    return { email: undefined }
  }

  return { email: user.email }
}

export function UserNav() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData>({ email: undefined })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error: userError } = await browserClient.auth.getUser()
        
        if (userError) throw userError

        const data = await getUserData(user)
        setUserData(data)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await browserClient.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getInitials = (email: string = 'U') => {
    return email.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {getInitials(userData.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              Usuário
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email || 'Sem email'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 