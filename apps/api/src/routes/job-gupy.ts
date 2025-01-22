import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';
import * as dotenv from 'dotenv';
dotenv.config();

interface GupyJobResponse {
  pageProps: {
    job: {
      id: number;
      name: string;
      description: string;
      prerequisites: string;
      responsibilities: string;
      relevantExperiences: string;
      addressLine: string;
      jobType: string;
      workplaceType: string;
      jobSteps: Array<{
        name: string;
        order: number;
      }>;
      publishedAt: string;
      expiresAt: string;
      company: {
        subdomain: string;
      };
      careerPage: {
        name: string;
      };
    };
  };
}

export const jobGupyHandler: ExpressHandler = async (
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
    // Extrair subdomain e jobId da URL usando a classe URL
    const gupyUrl = new URL(url);
    const subdomain = gupyUrl.hostname.split('.')[0];
    const jobIdMatch = gupyUrl.pathname.match(/\/jobs\/(\d+)/);

    if (!jobIdMatch) {
      res.status(400).json({ error: 'Invalid Gupy URL format' });
      return;
    }

    const jobId = jobIdMatch[1];

    // Fazer requisição para a API da Gupy
    const buildId = process.env.GUPY_BUILD_ID || 'YkTYkQ3OI0qrtyDGxDSAb'; // buildId do .env ou padrão

    const response = await axios.get<GupyJobResponse>(
      `https://${subdomain}.gupy.io/_next/data/${buildId}/pt/jobs/${jobId}.json`
    );

    const jobData = response.data.pageProps.job;

    // Processar e limpar o HTML das descrições
    const cleanHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    // Extrair lista de itens do HTML
    const extractListItems = (html: string): string[] => {
      const items = html.match(/<li[^>]*>(.*?)<\/li>/g) || [];
      return items.map(item => cleanHtml(item));
    };

    const formattedResponse = {
      id: jobData.id,
      titulo: jobData.name,
      empresa: jobData.company.subdomain,
      pagina_carreiras: jobData.careerPage.name,
      local_de_trabalho: {
        endereco: jobData.addressLine,
        tipo: jobData.workplaceType === 'on-site' ? 'Presencial' : 
              jobData.workplaceType === 'remote' ? 'Remoto' : 'Híbrido'
      },
      tipo_de_vaga: jobData.jobType,
      descricao: cleanHtml(jobData.description),
      responsabilidades: extractListItems(jobData.responsibilities),
      requisitos: extractListItems(jobData.prerequisites),
      beneficios: extractListItems(jobData.relevantExperiences),
      etapas_do_processo: jobData.jobSteps
        .sort((a, b) => a.order - b.order)
        .map(step => step.name),
      data_de_publicacao: new Date(jobData.publishedAt).toISOString().split('T')[0],
      data_de_expiracao: new Date(jobData.expiresAt).toISOString().split('T')[0]
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
};