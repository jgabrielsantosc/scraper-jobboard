import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FieldMappingProps {
  sourceFields: string[]
  destinationFields: string[]
  mappings: Record<string, string>
  onMappingChange: (mappings: Record<string, string>) => void
}

export function FieldMapping({
  sourceFields,
  destinationFields,
  mappings,
  onMappingChange,
}: FieldMappingProps) {
  const [searchSource, setSearchSource] = useState("")
  const [searchDest, setSearchDest] = useState("")

  // Filtra os campos com base na busca
  const filteredSourceFields = useMemo(() => {
    return sourceFields.filter((field) =>
      field.toLowerCase().includes(searchSource.toLowerCase())
    )
  }, [sourceFields, searchSource])

  const filteredDestFields = useMemo(() => {
    return destinationFields.filter((field) =>
      field.toLowerCase().includes(searchDest.toLowerCase())
    )
  }, [destinationFields, searchDest])

  const handleMappingChange = (destField: string, sourceField: string) => {
    const newMappings = { ...mappings, [destField]: sourceField }
    onMappingChange(newMappings)
  }

  const removeMappingForField = (destField: string) => {
    const newMappings = { ...mappings }
    delete newMappings[destField]
    onMappingChange(newMappings)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Campos de Destino */}
        <div className="space-y-2">
          <h3 className="font-medium">Campos do Sistema</h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campo do sistema..."
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              className="pl-8"
            />
          </div>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-2">
              {filteredDestFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent"
                >
                  <span className="font-medium">{field}</span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={mappings[field] || ""}
                      onValueChange={(value) => handleMappingChange(field, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar campo..."
                            value={searchSource}
                            onChange={(e) => setSearchSource(e.target.value)}
                            className="pl-8 mb-2"
                          />
                        </div>
                        {filteredSourceFields.map((sourceField) => (
                          <SelectItem key={sourceField} value={sourceField}>
                            {sourceField}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mappings[field] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMappingForField(field)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Mapeamentos Ativos */}
        <div className="space-y-2">
          <h3 className="font-medium">Mapeamentos Ativos</h3>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-2">
              {Object.entries(mappings).map(([destField, sourceField]) => (
                <div
                  key={destField}
                  className="flex items-center justify-between p-2 rounded bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{destField}</span>
                    <span className="text-sm text-muted-foreground">
                      ↳ {sourceField}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMappingForField(destField)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {Object.keys(mappings).length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  Nenhum mapeamento configurado
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
} 