import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../../types/types';

export const scraperJobAblerHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    // Extrair o slug do jobboard da URL
    const slug = new URL(url).hostname.split('.')[0];
    const allUrls: string[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const apiUrl = `https://${slug}.abler.com.br/api_v/v1/vagas.json?&page=${currentPage}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Extrair URLs das vagas
      const vacancyUrls = data.vacancies.data.map((vacancy: any) => vacancy.links.vacancy_url);
      allUrls.push(...vacancyUrls);

      // Verificar paginação
      hasNextPage = data.pagy.next !== null;
      currentPage++;
    }

    if (allUrls.length === 0) {
      res.status(404).json([]);
    } else {
      res.json(allUrls);
    }
  } catch (error) {
    console.error('Erro ao coletar URLs das vagas:', error);
    res.status(500).json([]);
  }
};