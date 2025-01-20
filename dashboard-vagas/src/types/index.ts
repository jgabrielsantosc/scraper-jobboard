export interface Empresa {
  id: number;
  nome: string;
  jobboard: string;
  status: boolean;
  ultima_execucao?: string;
}

export interface Vaga {
  id: number;
  url: string;
  empresa_id: number;
  empresa_nome?: string;
  titulo?: string;
  status: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface FilaProcessamento {
  url: string;
  empresa_id: number;
  status: boolean;
  adicionado_em: string;
}

export interface DashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  total_vagas: number;
  vagas_ativas: number;
  vagas_na_fila: number;
} 