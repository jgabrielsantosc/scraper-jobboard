import { supabase } from '../config/supabase';

export interface DashboardStats {
  total_empresas: number;
  empresas_ativas: number;
  total_vagas: number;
  vagas_ativas: number;
  vagas_na_fila: number;
}

export class StatsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }

    return data;
  }

  static async getEmpresaStats(empresa_id: string): Promise<{
    total_vagas: number;
    vagas_ativas: number;
  }> {
    const { data, error } = await supabase
      .from('vagas')
      .select('id, status')
      .eq('empresa_id', empresa_id);

    if (error) {
      console.error('Erro ao buscar estatísticas da empresa:', error);
      throw error;
    }

    return {
      total_vagas: data.length,
      vagas_ativas: data.filter(vaga => vaga.status).length
    };
  }

  static async getFilaStats(): Promise<{
    pendentes: number;
    processando: number;
    falhas: number;
  }> {
    const { data, error } = await supabase
      .from('fila_processamento')
      .select('status');

    if (error) {
      console.error('Erro ao buscar estatísticas da fila:', error);
      throw error;
    }

    return {
      pendentes: data.filter(job => job.status === 'pendente').length,
      processando: data.filter(job => job.status === 'processando').length,
      falhas: data.filter(job => job.status === 'falha').length
    };
  }
} 