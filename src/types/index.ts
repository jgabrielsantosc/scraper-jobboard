import { Request, Response, NextFunction } from 'express';

export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export interface VagaData {
  titulo: string;
  area?: string;
  senioridade?: string;
  modelo_trabalho?: string;
  modelo_contrato?: string;
  localizacao?: {
    cidade?: string;
    estado?: string;
    pais?: string;
  };
  descricao?: string;
  requisitos?: string[];
  beneficios?: string[];
}

export interface Empresa {
  id: number;
  nome: string;
  site?: string;
  linkedin?: string;
  jobboard: string;
  created_at: Date;
  updated_at: Date;
  ultima_execucao?: Date;
  status: boolean;
}

export interface Vaga {
  id: number;
  empresa_id: number;
  url: string;
  titulo: string;
  area?: string;
  senioridade?: string;
  modelo_trabalho?: string;
  modelo_contrato?: string;
  localizacao?: Record<string, any>;
  descricao?: string;
  requisitos?: string[];
  beneficios?: string[];
  status: boolean;
  data_importacao?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  vagas_ativas: number;
  vagas_na_fila: number;
}

export interface JobData {
  empresa_id: number;
  url: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  tentativas: number;
  erro?: string;
  data_processamento?: Date;
} 