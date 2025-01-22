import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DashboardStats } from '../types';

export async function getStats(req: Request, res: Response) {
  try {
    console.log('Buscando estatísticas...');
    
    // Buscar total de empresas
    const { count: total_empresas } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true });

    // Buscar empresas ativas
    const { count: empresas_ativas } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
      .eq('status', true);

    // Buscar vagas ativas
    const { count: vagas_ativas } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('status', true);

    // Buscar estatísticas da fila
    const { data: queue_stats } = await supabase
      .rpc('get_queue_stats');

    const stats: DashboardStats = {
      total_empresas: total_empresas || 0,
      empresas_ativas: empresas_ativas || 0,
      vagas_ativas: vagas_ativas || 0,
      vagas_na_fila: queue_stats?.total || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
} 