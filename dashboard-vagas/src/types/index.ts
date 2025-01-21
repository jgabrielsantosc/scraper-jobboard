export interface Empresa {
  id: number;
  nome: string;
  jobboard: string;
  status: boolean;
  ultima_execucao: string;
  total_vagas: number;
  vagas_ativas: number;
}

export interface Vaga {
  id: number;
  empresa_id: number;
  empresa_nome: string;
  url: string;
  titulo: string;
  area: string;
  senioridade: string;
  modelo_trabalho: string;
  modelo_contrato: string;
  localizacao: {
    cidade?: string;
    estado?: string;
    pais?: string;
  };
  descricao: string;
  requisitos: string[];
  beneficios: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  atualizado_em: string;
}

export interface FilaProcessamento {
  empresa_id: number;
  url: string;
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