import { useState, useEffect } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { logger } from '@/lib/logger'
import { ErrorBoundary } from '@/components/error-boundary'

interface ApiKeySelectorProps {
  savedApiKey: string | null
  onSelect: (value: string) => void
  isLoading?: boolean
}

export function ApiKeySelector({ savedApiKey, onSelect, isLoading = false }: ApiKeySelectorProps) {
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'new', label: '+ Adicionar nova API Key' }
  ])

  useEffect(() => {
    logger.info('Atualizando opções do seletor', {
      savedApiKey: savedApiKey ? `...${savedApiKey.slice(-4)}` : 'nenhuma'
    })

    const newOptions = [{ value: 'new', label: '+ Adicionar nova API Key' }]
    
    if (savedApiKey) {
      newOptions.unshift({
        value: savedApiKey,
        label: `API Key (${savedApiKey.slice(-4)})`
      })
      setSelectedValue(savedApiKey)
    }

    setOptions(newOptions)
  }, [savedApiKey])

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    onSelect(value)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <Label>Selecione uma API Key existente ou crie uma nova</Label>
        
        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            Carregando API Keys...
          </div>
        ) : (
          <>
            <Combobox
              options={options}
              value={selectedValue}
              onValueChange={handleSelect}
              placeholder="Selecione uma API Key..."
            />
            
            <p className="text-sm text-muted-foreground">
              {savedApiKey 
                ? 'Você pode usar uma API Key existente ou adicionar uma nova'
                : 'Adicione sua primeira API Key do Airtable'}
            </p>
          </>
        )}
      </div>
    </ErrorBoundary>
  )
} 