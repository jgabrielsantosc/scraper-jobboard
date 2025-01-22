import { supabase } from '../config/supabase';

export interface Empresa {
  id: string;
  nome: string;
  site?: string;
  linkedin?: string;
  jobboard: string;
  status: boolean;
  ultima_execucao?: Date;
  airtable_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmpresaComStats extends Empresa {
  total_vagas: number;
  vagas_ativas: number;
}

export class EmpresaService {
  static async listar(): Promise<EmpresaComStats[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select(`
        *,
        vagas:vagas(count),
        vagas_ativas:vagas(count)
      `)
      .eq('vagas_ativas.status', true);

    if (error) {
      console.error('Erro ao listar empresas:', error);
      throw error;
    }

    return data.map(empresa => ({
      ...empresa,
      total_vagas: empresa.vagas.count,
      vagas_ativas: empresa.vagas_ativas.count
    }));
  }

  static async buscarPorId(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }

    return data;
  }

  static async criar(empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert([empresa])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }

    return data;
  }

  static async atualizar(id: string, empresa: Partial<Empresa>): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .update(empresa)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  static async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir empresa:', error);
      throw error;
    }
  }

  static async atualizarUltimaExecucao(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .update({ ultima_execucao: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar última execução:', error);
      throw error;
    }
  }
} 