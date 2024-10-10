import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

export const jobInhireHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v1/scrape';

  console.log('Variáveis de ambiente em job-inhire.ts:');
  console.log(`FIRECRAWL_API_URL: ${FIRECRAWL_API_URL}`);
  console.log(`FIRECRAWL_API_KEY: ${FIRECRAWL_API_KEY ? 'Definido' : 'Não definido'}`);

  if (!FIRECRAWL_API_KEY) {
    console.error('FIRECRAWL_API_KEY não está definido');
    res.status(500).json({ error: 'Erro de configuração do servidor' });
    return;
  }

  try {
    console.log(`Iniciando a extração de dados da URL: ${url}`);

    const response = await axios.post(FIRECRAWL_API_URL, {
      url: url,
      formats: ['markdown'],
      waitFor: 5000
    }, {
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const { data } = response.data;

    if (!data || !data.markdown) {
      throw new Error('Dados não encontrados na resposta do Firecrawl');
    }

    console.log('Conteúdo da vaga extraído com sucesso');
    res.json({ content: data.markdown });

  } catch (error: any) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({
      error: 'Erro ao coletar informações da vaga',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};