import { Request, Response } from 'express';
import type { RequestHandler } from 'express';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import { env } from '../config/env';
import axios from 'axios';
import { Empresa, VagaData } from '../types';

const EMPRESA_NAO_ENCONTRADA = 'Empresa não encontrada';

export const listarEmpresas: RequestHandler = async (req, res) => {
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
};

async function buscarEmpresa(id: string) {
  const { rows: [empresa] } = await pool.query(
    'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
    [id]
  );
  return empresa;
}

async function desativarVagas(vagasIds: number[]) {
  if (vagasIds.length === 0) return;
  
  await pool.query(
    'UPDATE vagas SET status = false WHERE id = ANY($1)',
    [vagasIds]
  );
}

async function extrairUrlsJobBoard(url: string): Promise<string[]> {
  try {
    console.log('Fazendo requisição para scraper-job com URL:', url);
    const response = await axios.post(`${env.API_BASE_URL}/scraper-job`, { url });
    
    // Log da resposta para debug
    console.log('Resposta do scraper-job:', JSON.stringify(response.data, null, 2));
    
    // Se a resposta já é um array, retorna diretamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Se a resposta tem a propriedade urls, retorna ela
    if (response.data.urls && Array.isArray(response.data.urls)) {
      return response.data.urls;
    }
    
    // Se a resposta tem a propriedade vagas, mapeia para urls
    if (response.data.vagas && Array.isArray(response.data.vagas)) {
      return response.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }
    
    // Se chegou aqui, temos um formato inesperado
    console.warn('Formato de resposta inesperado do scraper-job:', response.data);
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição ao scraper-job:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Erro ao extrair URLs do job board:', error);
    }
    return [];
  }
}

export const extrairUrlsVagas: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await buscarEmpresa(id);

    if (!empresa) {
      res.status(404).json({ error: EMPRESA_NAO_ENCONTRADA });
      return;
    }

    console.log(`Extraindo URLs de vagas da empresa ${empresa.nome} (${empresa.jobboard})`);

    const urlsExtraidas = await extrairUrlsJobBoard(empresa.jobboard);

    if (urlsExtraidas.length === 0) {
      res.json({
        empresa_id: empresa.id,
        empresa_nome: empresa.nome,
        erro: 'Não foi possível extrair URLs de vagas neste momento',
        total_urls_extraidas: 0,
        urls_novas: [],
        vagas_desativadas: 0
      });
      return;
    }

    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    await desativarVagas(vagasDesativadas.map(v => v.id));

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
    res.status(500).json({ 
      error: 'Erro ao extrair URLs das vagas',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

async function processarVaga(url: string, empresaId: number) {
  const aiResponse = await axios.post(`${env.API_BASE_URL}/job-ai-analysis`, { url });
  const vagaData = aiResponse.data as VagaData;

  const { rows: [novaVaga] } = await pool.query(`
    INSERT INTO vagas (
      empresa_id, url, titulo, area, senioridade, 
      modelo_trabalho, modelo_contrato, localizacao, 
      descricao, requisitos, beneficios, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
    RETURNING id
  `, [
    empresaId,
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

  return {
    id: novaVaga.id,
    url,
    titulo: vagaData.titulo || 'Sem título'
  };
}

export const processarVagas: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await buscarEmpresa(id);

    if (!empresa) {
      res.status(404).json({ error: EMPRESA_NAO_ENCONTRADA });
      return;
    }

    const urlsExtraidas = await extrairUrlsJobBoard(empresa.jobboard);

    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    await desativarVagas(vagasDesativadas.map(v => v.id));

    const urlsExistentes = new Set(vagasAtivas.map(v => v.url));
    const urlsNovas = urlsExtraidas.filter((url: string) => !urlsExistentes.has(url));

    const vagasProcessadas = [];
    const erros = [];

    for (const url of urlsNovas) {
      try {
        const vaga = await processarVaga(url, empresa.id);
        vagasProcessadas.push(vaga);
      } catch (error) {
        console.error(`Erro ao processar vaga ${url}:`, error);
        erros.push({ 
          url, 
          erro: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
      }
    }

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
}; 