import { Request, Response } from 'express';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import { DashboardStats } from '../types';

export async function getStats(req: Request, res: Response) {
  try {
    console.log('Buscando estatísticas...');
    
    // Testar conexões
    await pool.query('SELECT NOW()');
    await redis.ping();
    
    const [
      { total_empresas } = { total_empresas: 0 },
      vagas_na_fila = 0
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_empresas FROM empresas')
        .then(result => result.rows[0]),
      redis.llen('jobs_to_process')
    ]);

    // Buscar empresas ativas
    const { rows: [{ empresas_ativas = 0 }] } = await pool.query(`
      SELECT COUNT(DISTINCT e.id) as empresas_ativas 
      FROM empresas e 
      INNER JOIN rotinas r ON e.id = r.empresa_id 
      WHERE r.ativo = true
    `);

    // Buscar vagas ativas
    const { rows: [{ vagas_ativas = 0 }] } = await pool.query(`
      SELECT COUNT(*) as vagas_ativas 
      FROM vagas v 
      WHERE v.status = true
    `);

    const stats: DashboardStats = {
      total_empresas,
      empresas_ativas,
      vagas_ativas,
      vagas_na_fila
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
} 