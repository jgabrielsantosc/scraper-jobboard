import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

export const scraperJobSolidesHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const companyName = new URL(url).hostname.split('.')[0];
    const firstPageResponse = await axios.get(
      `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=1&slug=${companyName}`
    );

    const totalPages = firstPageResponse.data.data.totalPages;
    const allJobs: any[] = [];

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(
        `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=${page}&slug=${companyName}`
      );
      allJobs.push(...response.data.data.data);
    }

    const baseUrl = `https://${companyName}.vagas.solides.com.br/vaga/`;
    const jobUrls = allJobs.map(job => `${baseUrl}${job.id}`);

    if (jobUrls.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: jobUrls.length, vagas: jobUrls });
    }
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  }
};