import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../../types/types';
import { GreenhouseJobsResponse, GreenhouseJob } from '../../types/jobboards/greenhouse';

export const scraperJobGreenhouse: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const slug = extractSlug(url);
    if (!slug) {
      throw new Error('Não foi possível extrair o identificador da empresa da URL');
    }

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
    const response = await axios.get<GreenhouseJobsResponse>(apiUrl);

    if (!response.data || !response.data.jobs) {
      throw new Error('Resposta da API inválida');
    }

    const jobUrls = response.data.jobs.map((job: GreenhouseJob) => job.absolute_url);

    console.log(`URLs coletadas com sucesso para ${slug}:`, jobUrls.length);
    res.json(jobUrls);

  } catch (error) {
    console.error('Erro ao coletar URLs das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar URLs das vagas' });
  }
};

function extractSlug(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Remove barras do final da URL
    const pathname = urlObj.pathname.replace(/\/$/, '');
    
    // Extrai o último segmento da URL que será o slug
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || null;
    
  } catch (error) {
    console.error('Erro ao extrair slug:', error);
    return null;
  }
}
