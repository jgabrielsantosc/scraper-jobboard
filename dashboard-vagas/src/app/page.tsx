import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getEmpresas, getFilaProcessamento, getLogs, getStats, getVagas, processarVagas } from "@/services/api"
import { Suspense } from "react"

async function Stats() {
  const stats = await getStats()
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_empresas}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.empresas_ativas}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.vagas_ativas}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vagas na Fila</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.vagas_na_fila}</div>
        </CardContent>
      </Card>
    </div>
  )
}

async function EmpresasTable() {
  const empresas = await getEmpresas()
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Job Board</TableHead>
          <TableHead>Total de Vagas</TableHead>
          <TableHead>Vagas Ativas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Última Execução</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {empresas.map(empresa => (
          <TableRow key={empresa.id}>
            <TableCell>{empresa.id}</TableCell>
            <TableCell>
              <a 
                href={`/empresa/${empresa.id}`} 
                className="text-primary hover:underline"
              >
                {empresa.nome}
              </a>
            </TableCell>
            <TableCell>
              <a 
                href={empresa.jobboard} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:underline"
              >
                {empresa.jobboard}
              </a>
            </TableCell>
            <TableCell>{empresa.total_vagas || 0}</TableCell>
            <TableCell>{empresa.vagas_ativas || 0}</TableCell>
            <TableCell>{empresa.status ? 'Ativo' : 'Inativo'}</TableCell>
            <TableCell>
              {empresa.ultima_execucao ? (
                <div className="flex flex-col">
                  <span>{new Date(empresa.ultima_execucao).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(empresa.ultima_execucao).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ) : '-'}
            </TableCell>
            <TableCell>
              <form action={processarVagas}>
                <input type="hidden" name="empresaId" value={empresa.id} />
                <Button 
                  type="submit"
                  variant="outline" 
                  size="sm"
                >
                  Processar Vagas
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function VagasTable() {
  const vagas = await getVagas()
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Área</TableHead>
          <TableHead>Senioridade</TableHead>
          <TableHead>Modelo de Trabalho</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Atualizado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vagas.map(vaga => (
          <TableRow key={vaga.id}>
            <TableCell>{vaga.id}</TableCell>
            <TableCell>
              <a 
                href={`/empresa/${vaga.empresa_id}`} 
                className="text-primary hover:underline"
              >
                {vaga.empresa_nome}
              </a>
            </TableCell>
            <TableCell>{vaga.titulo}</TableCell>
            <TableCell>{vaga.area}</TableCell>
            <TableCell>{vaga.senioridade}</TableCell>
            <TableCell>{vaga.modelo_trabalho}</TableCell>
            <TableCell>{vaga.status ? 'Ativa' : 'Inativa'}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{new Date(vaga.atualizado_em).toLocaleDateString('pt-BR')}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(vaga.atualizado_em).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function FilaTable() {
  const fila = await getFilaProcessamento()
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa ID</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Adicionado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fila.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.empresa_id}</TableCell>
            <TableCell className="max-w-md truncate">{item.url}</TableCell>
            <TableCell>{item.status ? 'Processando' : 'Pendente'}</TableCell>
            <TableCell>{item.adicionado_em}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function LogsView() {
  const logs = await getLogs()
  
  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const [timestamp, ...message] = log.split('] ')
        return (
          <div key={index} className="flex items-start space-x-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">
              {new Date(timestamp.slice(1)).toLocaleString('pt-BR')}
            </span>
            <span>{message.join('] ')}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Dashboard de Vagas</h1>
      
      <Suspense fallback={<div>Carregando estatísticas...</div>}>
        <Stats />
      </Suspense>

      <Tabs defaultValue="empresas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="vagas">Vagas</TabsTrigger>
          <TabsTrigger value="fila">Fila de Processamento</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando empresas...</div>}>
                <EmpresasTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vagas">
          <Card>
            <CardHeader>
              <CardTitle>Vagas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando vagas...</div>}>
                <VagasTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fila">
          <Card>
            <CardHeader>
              <CardTitle>Fila de Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando fila...</div>}>
                <FilaTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando logs...</div>}>
                <LogsView />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
