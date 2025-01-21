import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../../types/types';
import { GreenhouseJob, GreenhouseDepartment } from '../../types/jobboards/greenhouse';

export const jobGreenhouseHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const { slug, jobId } = extractJobInfo(url);
    
    if (!slug || !jobId) {
      throw new Error('Não foi possível extrair as informações necessárias da URL');
    }

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${jobId}`;
    const response = await axios.get<GreenhouseJob>(apiUrl);

    if (!response.data) {
      throw new Error('Resposta da API inválida');
    }

    const jobData = {
      title: response.data.title,
      location: response.data.location?.name,
      content: decodeHtmlEntities(response.data.content || ''),
      departments: response.data.departments?.map((dept: GreenhouseDepartment) => dept.name) || [],
      updated_at: response.data.updated_at
    };

    res.json(jobData);

  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
};

function extractJobInfo(url: string): { slug: string | null; jobId: string | null } {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\/$/, '');
    const segments = pathname.split('/').filter(Boolean);
    
    // O ID da vaga é sempre o último segmento
    const jobId = segments[segments.length - 1];
    
    // O slug é o primeiro segmento após 'greenhouse.io'
    const hostname = urlObj.hostname;
    const slug = hostname.includes('boards.greenhouse.io') ? 
      segments[0] : 
      segments[segments.length - 3];

    return { slug, jobId };
    
  } catch (error) {
    console.error('Erro ao extrair informações da URL:', error);
    return { slug: null, jobId: null };
  }
}

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}