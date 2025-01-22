import { supabase } from '../config/supabase';

export interface Vaga {
  id: string;
  url: string;
  empresa_id: string;
  titulo?: string;
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
  status: boolean;
  data_importacao: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface VagaComEmpresa extends Vaga {
  empresa_nome: string;
  empresa_jobboard: string;
}

export class VagaService {
  static async listar(limit = 100): Promise<VagaComEmpresa[]> {
    const { data, error } = await supabase
      .from('vagas')
      .select(`
        *,
        empresas (
          nome,
          jobboard
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao listar vagas:', error);
      throw error;
    }

    return data.map(vaga => ({
      ...vaga,
      empresa_nome: vaga.empresas.nome,
      empresa_jobboard: vaga.empresas.jobboard
    }));
  }

  static async buscarPorEmpresa(empresa_id: string): Promise<VagaComEmpresa[]> {
    const { data, error } = await supabase
      .from('vagas')
      .select(`
        *,
        empresas (
          nome,
          jobboard
        )
      `)
      .eq('empresa_id', empresa_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vagas da empresa:', error);
      throw error;
    }

    return data.map(vaga => ({
      ...vaga,
      empresa_nome: vaga.empresas.nome,
      empresa_jobboard: vaga.empresas.jobboard
    }));
  }

  static async criar(vaga: Omit<Vaga, 'id' | 'created_at' | 'updated_at'>): Promise<Vaga> {
    const { data, error } = await supabase
      .from('vagas')
      .insert([vaga])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar vaga:', error);
      throw error;
    }

    return data;
  }

  static async atualizar(id: string, vaga: Partial<Vaga>): Promise<void> {
    const { error } = await supabase
      .from('vagas')
      .update(vaga)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar vaga:', error);
      throw error;
    }
  }

  static async desativar(id: string): Promise<void> {
    const { error } = await supabase
      .from('vagas')
      .update({ status: false })
      .eq('id', id);

    if (error) {
      console.error('Erro ao desativar vaga:', error);
      throw error;
    }
  }

  static async desativarPorEmpresa(empresa_id: string): Promise<void> {
    const { error } = await supabase
      .from('vagas')
      .update({ status: false })
      .eq('empresa_id', empresa_id);

    if (error) {
      console.error('Erro ao desativar vagas da empresa:', error);
      throw error;
    }
  }

  static async buscarPorUrl(url: string, empresa_id: string): Promise<Vaga | null> {
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .eq('url', url)
      .eq('empresa_id', empresa_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar vaga por URL:', error);
      throw error;
    }

    return data;
  }
} 