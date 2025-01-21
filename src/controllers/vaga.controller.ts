import { Request, Response } from 'express';
import { pool } from '../config/database';
import { env } from '../config/env';
import axios from 'axios';
import { VagaData } from '../types';

export async function listarVagas(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT 
        v.id, 
        v.titulo,
        v.url,
        v.empresa_id,
        v.area,
        v.senioridade,
        v.modelo_trabalho,
        v.modelo_contrato,
        v.localizacao,
        v.status,
        v.data_importacao,
        v.created_at as criado_em, 
        v.updated_at as atualizado_em,
        e.nome as empresa_nome,
        e.jobboard
      FROM vagas v 
      JOIN empresas e ON v.empresa_id = e.id 
      ORDER BY v.id DESC 
      LIMIT 100
    `);

    // Formatar os dados para o frontend
    const vagas = result.rows.map(vaga => ({
      id: vaga.id,
      url: vaga.url || `${vaga.jobboard}/jobs/${vaga.id}`,
      empresa_id: vaga.empresa_id,
      empresa_nome: vaga.empresa_nome,
      titulo: vaga.titulo,
      area: vaga.area,
      senioridade: vaga.senioridade,
      modelo_trabalho: vaga.modelo_trabalho,
      status: vaga.status,
      criado_em: vaga.criado_em,
      atualizado_em: vaga.atualizado_em
    }));

    res.json(vagas);
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
}

export async function processarVaga(req: Request, res: Response) {
  try {
    const { url, empresa_id } = req.body;

    if (!url || !empresa_id) {
      res.status(400).json({ error: 'URL e empresa_id são obrigatórios' });
      return;
    }

    // Verificar se a vaga já existe
    const { rows: [vagaExistente] } = await pool.query(
      'SELECT id FROM vagas WHERE url = $1 AND empresa_id = $2',
      [url, empresa_id]
    );

    if (vagaExistente) {
      res.status(409).json({ error: 'Vaga já existe', vaga_id: vagaExistente.id });
      return;
    }

    // Processar vaga com IA
    const aiResponse = await axios.post(`${env.API_BASE_URL}/job-ai-analysis`, {
      url
    });

    // Inserir vaga no banco
    const vagaData = aiResponse.data as VagaData;
    const { rows: [novaVaga] } = await pool.query(`
      INSERT INTO vagas (
        empresa_id, url, titulo, area, senioridade, 
        modelo_trabalho, modelo_contrato, localizacao, 
        descricao, requisitos, beneficios, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING id
    `, [
      empresa_id,
      url,
      vagaData.titulo || 'Sem título',
      vagaData.area || null,
      vagaData.senioridade || null,
      vagaData.modelo_trabalho || null,
      vagaData.modelo_contrato || null,
      JSON.stringify(vagaData.localizacao || {}),
      vagaData.descricao || '',
      JSON.stringify(vagaData.requisitos || []),
      JSON.stringify(vagaData.beneficios || [])
    ]);

    res.json({
      message: 'Vaga processada com sucesso',
      vaga_id: novaVaga.id,
      dados: vagaData
    });
  } catch (error) {
    console.error('Erro ao processar vaga:', error);
    res.status(500).json({ error: 'Erro ao processar vaga' });
  }
} 