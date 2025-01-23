'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { listBases, getBaseSchema, AirtableBase, AirtableField } from '@/lib/airtable/api'
import { useToast } from "@/hooks/use-toast"
import { useAirtableIntegration } from '@/hooks/useAirtableIntegration'
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
import { logger } from '@/lib/logger'
import { Combobox } from '@/components/ui/combobox'
import { ApiKeySelector } from '@/components/integrations/api-key-selector'
import { ErrorBoundary } from '@/components/error-boundary'

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
  const { 
    updateApiKey, 
    startSync, 
    currentJob, 
    isLoading, 
    savedApiKey,
    bases: savedBases,
    config
  } = useAirtableIntegration()
  const [open, setOpen] = useState(false)
  const [savedApiKeys, setSavedApiKeys] = useState<Array<{ value: string, label: string }>>([
    { value: 'new', label: '+ Adicionar nova API Key' }
  ])
  const [selectedSavedApiKey, setSelectedSavedApiKey] = useState<string>('')
  const [isNewKey, setIsNewKey] = useState(false)

  const loadBases = useCallback(async () => {
    try {
      logger.info('Iniciando carregamento das bases do Airtable')
      const basesList = await listBases(apiKey)
      logger.success('Bases carregadas com sucesso', basesList)
      setBases(Array.isArray(basesList) ? basesList : [])
    } catch (error) {
      logger.error('Falha ao carregar bases do Airtable', error)
      setBases([])
      toast({
        title: 'Erro ao carregar bases',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }, [apiKey, toast])

  useEffect(() => {
    if (savedApiKey) {
      logger.info('API Key encontrada, carregando configuração', { 
        lastFourDigits: savedApiKey.slice(-4) 
      })
      
      setSavedApiKeys([
        {
          value: savedApiKey,
          label: `API Key (${savedApiKey.slice(-4)})`
        },
        { value: 'new', label: '+ Adicionar nova API Key' }
      ])
      
      setSelectedSavedApiKey(savedApiKey)
      setApiKey(savedApiKey)
      setStep(2)
      setBases(Array.isArray(savedBases) ? savedBases : [])
    } else {
      logger.info('Nenhuma API Key encontrada')
      setStep(1)
    }
  }, [savedApiKey, savedBases])

  useEffect(() => {
    if (selectedSavedApiKey && selectedSavedApiKey !== 'new') {
      logger.info('Carregando bases para API Key selecionada')
      loadBases()
    }
  }, [selectedSavedApiKey, loadBases])

  const loadSchema = useCallback(async () => {
    if (!selectedBase) return

    try {
      logger.info('Carregando schema da base', { baseId: selectedBase })
      setIsLoadingSchema(true)
      const schema = await getBaseSchema(apiKey, selectedBase)
      logger.success('Schema carregado com sucesso', { tables: schema.tables })
      setTables(schema.tables)
    } catch (error) {
      logger.error('Falha ao carregar schema da base', error)
      toast({
        title: 'Erro ao carregar schema',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingSchema(false)
    }
  }, [apiKey, selectedBase, toast])

  const loadFields = useCallback(async () => {
    if (!selectedBase || !selectedTable) return

    try {
      logger.info('Carregando campos da tabela', { baseId: selectedBase, tableId: selectedTable })
      const schema = await getBaseSchema(apiKey, selectedBase)
      const table = schema.tables.find((t) => t.id === selectedTable)
      if (table) {
        logger.success('Campos carregados com sucesso', { fields: table.fields })
        setFields(table.fields || [])
      }
    } catch (error) {
      logger.error('Falha ao carregar campos da tabela', error)
      toast({
        title: 'Erro ao carregar campos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }, [apiKey, selectedBase, selectedTable, toast])

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
    logger.group('Salvando API Key')
    
    if (!apiKey) {
      logger.warn('API Key não fornecida')
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, insira sua API Key do Airtable',
        variant: 'destructive',
      })
      logger.groupEnd()
      return
    }

    try {
      logger.info('Iniciando atualização da API Key')
      const success = await updateApiKey(apiKey)
      
      if (success) {
        logger.success('API Key salva com sucesso')
        logger.info('Iniciando carregamento das bases')
        await loadBases()
        logger.success('Fluxo de configuração concluído')
        setStep(3)
      }
    } catch (error) {
      logger.error('Falha ao salvar API Key', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
    logger.groupEnd()
  }

  const handleSync = async () => {
    if (!selectedBase || !selectedTable || !fieldMapping) {
      logger.warn('Campos obrigatórios não preenchidos', { 
        selectedBase, 
        selectedTable, 
        fieldMappingKeys: Object.keys(fieldMapping) 
      })
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos necessários',
        variant: 'destructive',
      })
      return
    }

    setIsSyncing(true)
    logger.group('Iniciando sincronização')

    try {
      const metadata = {
        baseName: bases.find((b) => b.id === selectedBase)?.name,
        tableName: tables.find((t) => t.id === selectedTable)?.name,
      }
      
      logger.info('Configuração da sincronização', {
        baseId: selectedBase,
        tableId: selectedTable,
        type: selectedType,
        fieldMapping,
        metadata
      })

      await startSync(
        {
          baseId: selectedBase,
          tableId: selectedTable,
          type: selectedType,
          fieldMapping,
        },
        metadata,
        {
          onSuccess: (message: string) => {
            logger.success('Sincronização iniciada', { message })
            toast({
              title: 'Sincronização',
              description: message,
            })
          },
          onError: (message: string) => {
            logger.error('Erro na sincronização', { message })
            toast({
              title: 'Erro',
              description: message,
              variant: 'destructive',
            })
          },
        }
      )
    } finally {
      setIsSyncing(false)
      logger.groupEnd()
    }
  }

  const handleApiKeySelection = (value: string) => {
    logger.info('Seleção de API Key', { value })
    
    if (value === 'new') {
      setIsNewKey(true)
      setApiKey('')
      setStep(3)
    } else {
      setSelectedSavedApiKey(value)
      setApiKey(value)
      setIsNewKey(false)
      setStep(4)
    }
  }

  const handleBack = () => {
    logger.info('Voltando para seleção de API Key')
    setStep(2)
    setIsNewKey(false)
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setSelectedSavedApiKey(savedApiKey)
    }
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <ErrorBoundary>
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
                  <span className="font-medium">API Key</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Step>
              <Step value={3}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Credenciais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Step>
              <Step value={4}>
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
              <div className="max-w-md mx-auto space-y-6">
                <ApiKeySelector
                  savedApiKey={savedApiKey}
                  onSelect={handleApiKeySelection}
                  isLoading={isLoading}
                />
              </div>
            )}

            {step === 3 && (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSaveApiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Nova API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Digite sua API Key do Airtable"
                    />
                    <p className="text-sm text-muted-foreground">
                      Você pode encontrar sua API Key nas configurações da sua conta Airtable
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {savedApiKeys.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                      >
                        Voltar
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isLoading || !apiKey}
                      className="flex-1"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Credenciais'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="mb-4"
                  >
                    Alterar API Key
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    API Key atual: {apiKey ? `...${apiKey.slice(-4)}` : 'Não configurada'}
                  </div>
                </div>

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
                      {bases.length > 0 ? (
                        <Combobox
                          options={bases.map(base => ({
                            value: base.id,
                            label: base.name
                          }))}
                          value={selectedBase}
                          onValueChange={setSelectedBase}
                          placeholder="Selecione uma base..."
                          emptyText="Nenhuma base encontrada."
                          searchPlaceholder="Buscar base..."
                        />
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
                      <CardDescription>Selecione a tabela de origem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tables.length > 0 ? (
                        <Combobox
                          options={tables.map(table => ({
                            value: table.id,
                            label: table.name
                          }))}
                          value={selectedTable}
                          onValueChange={setSelectedTable}
                          placeholder="Selecione uma tabela..."
                          emptyText="Nenhuma tabela encontrada."
                          searchPlaceholder="Buscar tabela..."
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {selectedBase ? 'Nenhuma tabela disponível' : 'Selecione uma base primeiro'}
                        </div>
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
                      <Combobox
                        options={[
                          { value: 'companies', label: 'Empresas' },
                          { value: 'jobs', label: 'Vagas' }
                        ]}
                        value={selectedType}
                        onValueChange={(value) => setSelectedType(value as 'companies' | 'jobs')}
                        placeholder="Selecione o tipo..."
                        disabled={!selectedTable}
                      />
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
    </ErrorBoundary>
  )
}
