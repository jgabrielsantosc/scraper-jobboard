import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { EmpresaService } from '../services/empresa.service';
import { JobQueueService } from '../services/job-queue.service';
import { JobData } from '../types';
import axios from 'axios';
import { env } from '../config/env';

export async function listarEmpresas(req: Request, res: Response) {
  try {
    const empresas = await EmpresaService.listar();
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

export async function buscarEmpresaPorId(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await EmpresaService.buscarPorId(id);

    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
}

export async function criarEmpresa(req: Request, res: Response) {
  try {
    const empresa = await EmpresaService.criar(req.body);
    res.status(201).json(empresa);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
}

export async function atualizarEmpresa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await EmpresaService.atualizar(id, req.body);

    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    res.json(empresa);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
}

export async function excluirEmpresa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar se a empresa existe antes de excluir
    const empresa = await EmpresaService.buscarPorId(id);
    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    await EmpresaService.excluir(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
}

export async function extrairUrlsEmpresa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await EmpresaService.buscarPorId(id);

    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Fazer requisição para o scraper de URLs
    const response = await axios.post(`${env.API_BASE_URL}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar a resposta
    let urls: string[] = [];
    if (Array.isArray(response.data)) {
      urls = response.data;
    } else if (response.data.vagas) {
      urls = response.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_urls: urls.length,
      urls
    });
  } catch (error) {
    console.error('Erro ao extrair URLs:', error);
    res.status(500).json({ error: 'Erro ao extrair URLs das vagas' });
  }
}

export async function extrairVagasEmpresa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await EmpresaService.buscarPorId(id);

    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Primeiro extrair as URLs
    const urlsResponse = await axios.post(`${env.API_BASE_URL}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar URLs
    let urls: string[] = [];
    if (Array.isArray(urlsResponse.data)) {
      urls = urlsResponse.data;
    } else if (urlsResponse.data.vagas) {
      urls = urlsResponse.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }

    // Processar cada URL para extrair detalhes
    const vagas = await Promise.all(
      urls.map(async (url) => {
        try {
          // Extrair detalhes básicos
          const detalhesResponse = await axios.post(`${env.API_BASE_URL}/job-details`, { url });
          
          // Extrair detalhes com IA
          const aiResponse = await axios.post(`${env.API_BASE_URL}/job-ai-analysis`, { url });
          
          return {
            url,
            detalhes: detalhesResponse.data,
            analise_ia: aiResponse.data
          };
        } catch (error) {
          console.error(`Erro ao processar vaga ${url}:`, error);
          return {
            url,
            erro: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      })
    );

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_vagas: urls.length,
      vagas_processadas: vagas.length,
      vagas
    });
  } catch (error) {
    console.error('Erro ao extrair vagas:', error);
    res.status(500).json({ error: 'Erro ao extrair vagas da empresa' });
  }
}

export async function processarVagasEmpresa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await EmpresaService.buscarPorId(id);

    if (empresa === null) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Adicionar empresa na fila de processamento
    const jobData: JobData = {
      empresa_id: parseInt(empresa.id.toString(), 10),
      url: empresa.jobboard,
      status: 'pendente',
      tentativas: 0
    };

    await JobQueueService.adicionarNaFila(jobData);

    res.json({ 
      message: 'Empresa adicionada à fila de processamento',
      empresa_id: empresa.id
    });
  } catch (error) {
    console.error('Erro ao processar vagas da empresa:', error);
    res.status(500).json({ error: 'Erro ao processar vagas da empresa' });
  }
} 