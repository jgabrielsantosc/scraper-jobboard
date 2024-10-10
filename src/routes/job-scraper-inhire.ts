import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL;

export const scraperJobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  try {
    console.log(`Iniciando a extração de dados da URL: ${url}`);

    const response = await axios.post(FIRECRAWL_API_URL!, {
      url: url!,
      formats: ['links'],
      waitFor: 5000
    }, {
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

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
      if (!link.includes('/vagas/') || link.endsWith('/vagas')) {
        console.log(`URL ignorada: ${link}`);
        return false;
      }
      
      return link.includes('/vagas/') && !link.endsWith('/vagas');
    });

    console.log(`Total de vagas encontradas: ${jobUrls.length}`);

    res.json(jobUrls);

  } catch (error: any) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ 
      error: 'Erro ao coletar informações das vagas', 
      details: error.message, 
      stack: error.stack 
    });
  }
};