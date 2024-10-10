import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

const FIRECRAWL_API_KEY = 'fc-f756fef2af164725b4de3159572d8893';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';

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

  try {
    console.log(`Iniciando a extração de dados da URL: ${url}`);

    const response = await axios.post(FIRECRAWL_API_URL, {
      url,
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
      stack: error.stack,
    });
  }
};