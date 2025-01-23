'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { listBases, getBaseSchema, AirtableBase, AirtableField } from '@/lib/airtable/api'
import { useToast } from "@/hooks/use-toast"
import { useAirtableIntegration } from '@/hooks/use-airtable-integration'
import { FieldMapping } from '@/components/integrations/field-mapping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Steps, Step } from "@/components/ui/steps"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Database, Table2, FileJson } from 'lucide-react'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from '@/components/ui/label'

interface Base {
  id: string;
  name: string;
  permissionLevel: 'none' | 'read' | 'comment' | 'edit' | 'create';
}

interface Field {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface Table {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: Field[];
  description?: string;
}

const DESTINATION_FIELDS = {
  jobs: [
    'title',
    'area',
    'seniority',
    'work_model',
    'contract_type',
    'city',
    'state',
    'country',
    'requirements',
    'benefits',
  ],
  companies: [
    'name',
    'description',
    'website',
    'linkedin',
    'industry',
    'size',
    'logo_url',
  ],
}

export default function AirtableIntegrationPage() {
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [bases, setBases] = useState<AirtableBase[]>([])
  const [selectedBase, setSelectedBase] = useState<string>('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedType, setSelectedType] = useState<'companies' | 'jobs'>('jobs')
  const [tables, setTables] = useState<{ id: string; name: string }[]>([])
  const [fields, setFields] = useState<AirtableField[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()
  const { updateApiKey, startSync, currentJob, isLoading, savedApiKey } = useAirtableIntegration()
  const [open, setOpen] = useState(false)

  const loadBases = useCallback(async () => {
    try {
      const basesList = await listBases(apiKey)
      setBases(basesList)
    } catch (error) {
      console.error('Erro ao carregar bases:', error)
      toast({
        title: 'Erro ao carregar bases',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }, [apiKey, toast])

  useEffect(() => {
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setStep(3)
      loadBases()
    }
  }, [savedApiKey, loadBases])

  const loadSchema = useCallback(async () => {
    if (!selectedBase) return

    try {
      const schema = await getBaseSchema(apiKey, selectedBase)
      setTables(schema.tables)
    } catch (error) {
      console.error('Erro ao carregar schema:', error)
      toast({
        title: 'Erro ao carregar schema',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }, [apiKey, selectedBase, toast])

  const loadFields = useCallback(async () => {
    if (!selectedBase || !selectedTable) return

    try {
      const schema = await getBaseSchema(apiKey, selectedBase)
      const table = schema.tables.find((t) => t.id === selectedTable)
      if (table) {
        setFields(table.fields || [])
      }
    } catch (error) {
      console.error('Erro ao carregar campos:', error)
      toast({
        title: 'Erro ao carregar campos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }, [apiKey, selectedBase, selectedTable, toast])

  useEffect(() => {
    if (apiKey) {
      loadBases()
    }
  }, [apiKey, loadBases])

  useEffect(() => {
    if (selectedBase) {
      loadSchema()
    }
  }, [selectedBase, loadSchema])

  useEffect(() => {
    if (selectedTable) {
      loadFields()
    }
  }, [selectedTable, loadFields])

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!apiKey) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, insira sua API Key do Airtable',
        variant: 'destructive',
      })
      return
    }

    try {
      const success = await updateApiKey(apiKey)
      if (success) {
        await loadBases()
        setStep(3)
      }
    } catch (error) {
      console.error('Erro ao salvar API key:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }

  const handleSync = async () => {
    if (!selectedBase || !selectedTable || !fieldMapping) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos necessários',
        variant: 'destructive',
      })
      return
    }

    const metadata = {
      baseName: bases.find((b) => b.id === selectedBase)?.name,
      tableName: tables.find((t) => t.id === selectedTable)?.name,
    }

    await startSync(
      {
        baseId: selectedBase,
        tableId: selectedTable,
        type: selectedType,
        fieldMapping,
      },
      metadata,
      {
        onSuccess: (message) => {
          toast({
            title: 'Sincronização',
            description: message,
          })
        },
        onError: (message) => {
          toast({
            title: 'Erro',
            description: message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integração Airtable</h1>
          <p className="text-muted-foreground">Configure a integração com o Airtable para sincronizar seus dados.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Airtable</CardTitle>
          <CardDescription>
            Siga os passos abaixo para configurar a integração com o Airtable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps value={step} className="mb-8">
            <Step value={1}>
              <div className="flex items-center gap-2">
                <span className="font-medium">Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Step>
            <Step value={2}>
              <div className="flex items-center gap-2">
                <span className="font-medium">Credenciais</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Step>
            <Step value={3}>
              <span className="font-medium">Configuração</span>
            </Step>
          </Steps>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Image
                  src="/airtable-logo.png" 
                  alt="Airtable Logo" 
                  width={64} 
                  height={64}
                  style={{ width: 64, height: 64 }}
                  className="mb-4"
                />
                <h2 className="text-xl font-medium mb-2">Conectar com Airtable</h2>
                <p className="text-muted-foreground text-center mb-4">
                  Sincronize seus dados do Airtable automaticamente
                </p>
                <Button 
                  onClick={() => setStep(2)} 
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <span>Conectar Airtable</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Digite sua API Key do Airtable"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !apiKey}
                  className="w-full"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Credenciais'}
                </Button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <CardTitle className="text-lg">1. Base</CardTitle>
                    </div>
                    <CardDescription>Selecione a base do Airtable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(bases) && bases.length > 0 ? (
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {selectedBase
                              ? bases.find((base) => base.id === selectedBase)?.name
                              : "Selecione uma base..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar base..." />
                            <CommandEmpty>Nenhuma base encontrada.</CommandEmpty>
                            <CommandGroup>
                              {bases.map((base) => (
                                <CommandItem
                                  key={base.id}
                                  onSelect={() => {
                                    setSelectedBase(base.id)
                                    setOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedBase === base.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {base.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nenhuma base disponível
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4" />
                      <CardTitle className="text-lg">2. Tabela</CardTitle>
                    </div>
                    <CardDescription>Selecione a tabela do Airtable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSchema ? (
                      <div className="text-sm text-muted-foreground">
                        Carregando tabelas...
                      </div>
                    ) : (
                      <Select
                        value={selectedTable}
                        onValueChange={setSelectedTable}
                        disabled={!selectedBase || tables.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma tabela..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              {table.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      <CardTitle className="text-lg">3. Destino</CardTitle>
                    </div>
                    <CardDescription>Selecione a tabela de destino</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedType}
                      onValueChange={(value: 'companies' | 'jobs') => setSelectedType(value)}
                      disabled={!selectedTable}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma tabela..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="companies">Empresas</SelectItem>
                        <SelectItem value="jobs">Vagas</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {selectedBase && selectedTable && selectedType && !isLoadingSchema && (
                <>
                  {fields.length > 0 && (
                    <FieldMapping
                      sourceFields={fields}
                      destinationFields={DESTINATION_FIELDS[selectedType]}
                      selectedTable={selectedType}
                      mapping={fieldMapping}
                      onMappingChange={(field: string, value: string) => {
                        setFieldMapping(prev => ({
                          ...prev,
                          [field]: value
                        }))
                      }}
                    />
                  )}
                </>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSync}
                  disabled={
                    !selectedBase || 
                    !selectedTable || 
                    Object.keys(fieldMapping).length === 0 ||
                    isLoadingSchema ||
                    isSyncing
                  }
                >
                  {isSyncing ? 'Iniciando sincronização...' : 'Iniciar Sincronização'}
                </Button>
              </div>

              {currentJob && (
                <div className="mt-4">
                  <p>Status: {currentJob.status}</p>
                  {currentJob.total_records && currentJob.processed_records && (
                    <p>
                      Progresso: {currentJob.processed_records} de {currentJob.total_records} registros
                    </p>
                  )}
                  {currentJob.error_message && (
                    <p className="text-red-500">Erro: {currentJob.error_message}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
