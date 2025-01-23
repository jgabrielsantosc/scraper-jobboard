'use client'

import React, { useState } from 'react'
import { listBases } from '@/lib/airtable/api'
import { useToast } from "@/hooks/use-toast"
import { useAirtableIntegration } from '@/hooks/useAirtableIntegration'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Base {
  id: string
  name: string
}

export default function IntegrationsPage() {
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [bases, setBases] = useState<Base[]>([])
  const { toast } = useToast()
  const { isLoading, error, updateApiKey } = useAirtableIntegration()

  const handleApiKeySubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      // Primeiro tenta listar as bases para validar a API key
      const basesList = await listBases(apiKey)
      setBases(basesList)
      
      // Se chegou aqui, a key é válida
      await updateApiKey(apiKey)
      
      toast({
        title: "Sucesso",
        description: "Credenciais salvas com sucesso!",
      })
      
      setStep(3)
    } catch (error) {
      console.error('❌ Erro ao salvar credenciais:', error)
      toast({
        title: "Erro",
        description: "Falha ao salvar credenciais. Verifique sua chave API.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Integrações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurar Airtable</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Selecione a Plataforma</h2>
              <Button 
                onClick={() => setStep(2)} 
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Image 
                  src="/airtable-logo.png" 
                  alt="Airtable Logo" 
                  width={24} 
                  height={24}
                  style={{ width: 24, height: 24 }}
                />
                <span>Airtable</span>
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Airtable API Key
                </label>
                <Input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira sua chave API do Airtable"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !apiKey}
              >
                {isLoading ? 'Salvando...' : 'Salvar Credenciais'}
              </Button>
            </form>
          )}

          {step === 3 && bases.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Bases Disponíveis</h2>
              <div className="grid gap-2">
                {bases.map((base) => (
                  <div
                    key={base.id}
                    className="p-4 border rounded-lg"
                  >
                    {base.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 