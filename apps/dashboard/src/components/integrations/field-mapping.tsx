import React from 'react';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, AlertCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { AirtableField } from '@/lib/airtable/api'

interface FieldMappingProps {
  sourceFields: AirtableField[];
  destinationFields: string[];
  selectedTable: 'companies' | 'jobs';
  mapping: Record<string, string>;
  onMappingChange: (field: string, value: string) => void;
}

const FIELD_DESCRIPTIONS = {
  companies: {
    name: 'Nome da empresa',
    description: 'Descrição da empresa',
    jobboard_type: 'Tipo de job board',
    jobboard_url: 'URL do job board',
    logo_url: 'URL do logo',
    website: 'Website da empresa',
    status: 'Status da empresa'
  },
  jobs: {
    title: 'Título da vaga',
    area: 'Área de atuação',
    benefits: 'Benefícios oferecidos',
    city: 'Cidade',
    contract_type: 'Tipo de contrato',
    country: 'País',
    requirements: 'Requisitos da vaga',
    seniority: 'Nível de senioridade',
    state: 'Estado',
    status: 'Status da vaga',
    url: 'URL da vaga',
    work_model: 'Modelo de trabalho'
  }
} as const;

const FIELD_CATEGORIES = {
  companies: [
    { title: 'Informações Básicas', fields: ['name', 'description', 'website'] },
    { title: 'Job Board', fields: ['jobboard_type', 'jobboard_url'] },
    { title: 'Mídia', fields: ['logo_url'] },
    { title: 'Status', fields: ['status'] }
  ],
  jobs: [
    { title: 'Informações Básicas', fields: ['title', 'description', 'url'] },
    { title: 'Localização', fields: ['city', 'state', 'country'] },
    { title: 'Detalhes da Vaga', fields: ['area', 'seniority', 'contract_type', 'work_model'] },
    { title: 'Outros', fields: ['benefits', 'requirements', 'status'] }
  ]
} as const;

export function FieldMapping({
  sourceFields,
  destinationFields,
  selectedTable,
  mapping,
  onMappingChange,
}: FieldMappingProps) {
  if (!destinationFields?.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Nenhum campo de destino configurado
        </div>
      </Card>
    );
  }

  const getMappedSourceField = (destinationField: string) => {
    const mappedId = mapping[destinationField]
    return sourceFields.find(field => field.id === mappedId)
  }

  const getProgress = () => {
    const mappedFields = Object.keys(mapping).length
    const totalFields = destinationFields.length
    return Math.round((mappedFields / totalFields) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapeamento de Campos</CardTitle>
        <div className="h-2 bg-secondary rounded-full mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {destinationFields.map((field) => (
          <div key={field} className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{field}</p>
              <p className="text-xs text-muted-foreground">
                {getMappedSourceField(field)?.name || 'Selecione um campo'}
              </p>
            </div>
            <Command className="w-[200px]">
              <CommandInput placeholder="Buscar campo..." />
              <CommandEmpty>Nenhum campo encontrado</CommandEmpty>
              <CommandGroup>
                {sourceFields.map((sourceField) => (
                  <CommandItem
                    key={sourceField.id}
                    value={sourceField.name}
                    onSelect={() => onMappingChange(field, sourceField.id)}
                  >
                    <span>{sourceField.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 