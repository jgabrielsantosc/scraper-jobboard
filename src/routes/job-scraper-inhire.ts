import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

export const scraperJobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  console.log('Variáveis de ambiente em job-scraper-inhire.ts:');
  console.log(`FIRECRAWL_API_URL: ${process.env.FIRECRAWL_API_URL}`);
  console.log(`FIRECRAWL_API_KEY: ${process.env.FIRECRAWL_API_KEY ? 'Definido' : 'Não definido'}`);

  if (!process.env.FIRECRAWL_API_URL) {
    res.status(500).json({ error: 'FIRECRAWL_API_URL não está definido' });
    return;
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    res.status(500).json({ error: 'FIRECRAWL_API_KEY não está definido' });
    return;
  }

  try {
    // Garantir que a URL comece com 'https://'
    if (!url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validar a URL
    try {
      new URL(url);
    } catch (error) {
      res.status(400).json({ error: 'URL inválida fornecida' });
      return;
    }

    console.log(`Iniciando a extração de dados da URL: ${url}`);

    // Verificar se a URL termina com '/vagas' e adicionar se necessário
    if (!url.endsWith('/vagas')) {
      url += '/vagas';
    }

    console.log(`Fazendo requisição para: ${process.env.FIRECRAWL_API_URL}`);
    const response = await axios.post(process.env.FIRECRAWL_API_URL, {
      url: url,
      formats: ['links'],
      waitFor: 5000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta recebida do Firecrawl');
    const { data } = response.data;

    if (!data || !data.links) {
      throw new Error('Dados não encontrados na resposta do Firecrawl');
    }

    const jobUrls = data.links.filter((link: string) => {
      // Verifica se o link é uma URL válida
      try {
        new URL(link);
      } catch {
        return false;
      }
      
      // Verifica se o link contém '/vagas/' e não é a página principal de vagas
      return link.includes('/vagas/') && !link.endsWith('/vagas');
    });

    console.log(`Total de vagas encontradas: ${jobUrls.length}`);

    res.json(jobUrls);

  } catch (error: any) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ 
      error: 'Erro ao coletar informações das vagas', 
      details: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};