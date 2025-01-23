'use client'

import { browserClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { SupabaseError } from "@/types/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await browserClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Aguarda a sessão ser atualizada
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.refresh()
      router.push(redirectTo)
    } catch (error) {
      const supabaseError = error as SupabaseError
      toast({
        title: "Erro ao fazer login",
        description: supabaseError.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entre na sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-orange-600 hover:text-orange-500">
                Registre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-dynamic' 