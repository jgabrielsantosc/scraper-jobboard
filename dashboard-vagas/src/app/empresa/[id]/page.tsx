import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEmpresaById, getVagasByEmpresaId } from "@/services/api"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EmpresaPage({ params }: PageProps) {
  const empresa = await getEmpresaById(params.id)
  const vagas = await getVagasByEmpresaId(params.id)

  return (
    <main className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{empresa.nome}</h1>
        <p className="text-muted-foreground">
          Job Board: <a href={empresa.jobboard} target="_blank" rel="noopener noreferrer" className="underline">{empresa.jobboard}</a>
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="text-lg">{empresa.status ? 'Ativo' : 'Inativo'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Última Execução</dt>
              <dd className="text-lg">{new Date(empresa.ultima_execucao).toLocaleString('pt-BR')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total de Vagas</dt>
              <dd className="text-lg">{vagas.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Vagas Ativas</dt>
              <dd className="text-lg">{vagas.filter(vaga => vaga.status).length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vagas da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Senioridade</TableHead>
                <TableHead>Modelo de Trabalho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Atualizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vagas.map(vaga => (
                <TableRow key={vaga.id}>
                  <TableCell>{vaga.id}</TableCell>
                  <TableCell>{vaga.titulo}</TableCell>
                  <TableCell>{vaga.area}</TableCell>
                  <TableCell>{vaga.senioridade}</TableCell>
                  <TableCell>{vaga.modelo_trabalho}</TableCell>
                  <TableCell>{vaga.status ? 'Ativa' : 'Inativa'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(vaga.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(vaga.created_at).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(vaga.updated_at).toLocaleDateString('pt-BR')}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(vaga.updated_at).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
} 