export interface Empresa {
  id: string;
  nome: string;
  site?: string;
  linkedin?: string;
  jobboard: string;
  status: boolean;
  total_vagas?: number;
  vagas_ativas?: number;
  ultima_execucao?: string;
  created_at: string;
  updated_at: string;
}

export interface Vaga {
  id: string;
  url: string;
  empresa_id: string;
  empresa_nome: string;
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
  data_importacao: string;
  created_at: string;
  updated_at: string;
}

export interface FilaProcessamento {
  id: string;
  empresa_id: string;
  url: string;
  status: string;
  tentativas: number;
  erro?: string;
  adicionado_em: string;
  processado_em?: string;
}

export interface DashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  vagas_ativas: number;
  vagas_na_fila: number;
} 