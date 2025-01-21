import { Request, Response } from 'express';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import { env } from '../config/env';
import axios from 'axios';
import { Empresa, VagaData } from '../types';

export async function listarEmpresas(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.nome, 
        e.site,
        e.linkedin,
        e.jobboard,
        e.created_at,
        e.updated_at,
        r.ultima_execucao,
        r.ativo as status,
        COUNT(CASE WHEN v.status = true THEN 1 END) as vagas_ativas,
        COUNT(v.id) as total_vagas
      FROM empresas e 
      LEFT JOIN rotinas r ON e.id = r.empresa_id 
      LEFT JOIN vagas v ON e.id = v.empresa_id
      GROUP BY e.id, e.nome, e.site, e.linkedin, e.jobboard, e.created_at, e.updated_at, r.ultima_execucao, r.ativo
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
}

export async function extrairUrlsVagas(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Buscar informações da empresa
    const { rows: [empresa] } = await pool.query(
      'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
      [id]
    );

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    console.log(`Extraindo URLs de vagas da empresa ${empresa.nome} (${empresa.jobboard})`);

    // Extrair URLs das vagas
    const urlsResponse = await axios.post(`${env.API_BASE_URL}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar o retorno dos diferentes scrapers
    let urlsExtraidas: string[] = [];
    if (Array.isArray(urlsResponse.data)) {
      urlsExtraidas = urlsResponse.data;
    } else if (urlsResponse.data.vagas) {
      urlsExtraidas = urlsResponse.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }

    // Buscar vagas ativas da empresa
    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    // Identificar vagas que não estão mais disponíveis
    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    // Desativar vagas que não estão mais disponíveis
    if (vagasDesativadas.length > 0) {
      await pool.query(
        'UPDATE vagas SET status = false WHERE id = ANY($1)',
        [vagasDesativadas.map(v => v.id)]
      );
    }

    // Identificar novas URLs
    const urlsExistentes = new Set(vagasAtivas.map(v => v.url));
    const urlsNovas = urlsExtraidas.filter((url: string) => !urlsExistentes.has(url));

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_urls_extraidas: urlsExtraidas.length,
      urls_novas: urlsNovas,
      vagas_desativadas: vagasDesativadas.length
    });
  } catch (error) {
    console.error('Erro ao extrair URLs:', error);
    res.status(500).json({ error: 'Erro ao extrair URLs das vagas' });
  }
}

export async function processarVagas(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Buscar informações da empresa
    const { rows: [empresa] } = await pool.query(
      'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
      [id]
    );

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Extrair URLs usando a rota existente
    const urlsResponse = await axios.post(`${env.API_BASE_URL}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar URLs extraídas
    const urlsExtraidas = Array.isArray(urlsResponse.data) ? urlsResponse.data : 
                         urlsResponse.data.vagas?.map((v: any) => typeof v === 'string' ? v : v.url_job || v.url) || [];

    // Buscar vagas ativas da empresa
    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    // Identificar e desativar vagas que não estão mais disponíveis
    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    if (vagasDesativadas.length > 0) {
      await pool.query(
        'UPDATE vagas SET status = false WHERE id = ANY($1)',
        [vagasDesativadas.map(v => v.id)]
      );
    }

    // Identificar novas URLs
    const urlsExistentes = new Set(vagasAtivas.map(v => v.url));
    const urlsNovas = urlsExtraidas.filter((url: string) => !urlsExistentes.has(url));

    // Processar cada nova vaga
    const vagasProcessadas = [];
    const erros = [];

    for (const url of urlsNovas) {
      try {
        // Processar vaga com IA
        const aiResponse = await axios.post(`${env.API_BASE_URL}/job-ai-analysis`, { url });
        const vagaData = aiResponse.data as VagaData;

        // Inserir vaga no banco
        const { rows: [novaVaga] } = await pool.query(`
          INSERT INTO vagas (
            empresa_id, url, titulo, area, senioridade, 
            modelo_trabalho, modelo_contrato, localizacao, 
            descricao, requisitos, beneficios, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
          RETURNING id
        `, [
          empresa.id,
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

        vagasProcessadas.push({
          id: novaVaga.id,
          url,
          titulo: vagaData.titulo || 'Sem título'
        });
      } catch (error) {
        console.error(`Erro ao processar vaga ${url}:`, error);
        erros.push({ url, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
      }
    }

    // Atualizar última execução da rotina
    await pool.query(
      'UPDATE rotinas SET ultima_execucao = NOW() WHERE empresa_id = $1',
      [empresa.id]
    );

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_urls_extraidas: urlsExtraidas.length,
      vagas_novas_processadas: vagasProcessadas,
      vagas_desativadas: vagasDesativadas.length,
      erros: erros.length > 0 ? erros : undefined
    });
  } catch (error) {
    console.error('Erro ao processar vagas:', error);
    res.status(500).json({ error: 'Erro ao processar vagas' });
  }
} 