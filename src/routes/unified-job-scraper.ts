import { Request, Response, NextFunction } from 'express';
import { ExpressHandler } from '../types';
import { scraperJobGupy } from './job-scraper-gupy';
import { scraperJobInhireHandler } from './job-scraper-inhire';
import { scraperJobGreenhouse } from './job-scraper-greenhouse';
import { scraperJobWorkableHandler } from './job-scraper-workable';
import { scraperJobQuickinHandler } from './job-scraper-quickin';
import { scraperJobLeverHandler } from './job-scraper-lever';
import { scraperJobAblerHandler } from './job-scraper-abler';
import { scraperJobSolidesHandler } from './job-scraper-solides';

// Mapeamento de URLs para handlers
const jobBoardHandlers: { [key: string]: ExpressHandler } = {
  'gupy': scraperJobGupy,
  'inhire': scraperJobInhireHandler,
  'greenhouse': scraperJobGreenhouse,
  'workable': scraperJobWorkableHandler,
  'quickin': scraperJobQuickinHandler,
  'lever': scraperJobLeverHandler,
  'abler': scraperJobAblerHandler,
  'solides': scraperJobSolidesHandler,
  // Adicione outros mapeamentos conforme necessário
};

// Função para identificar o job board e chamar o handler apropriado
const handleJobBoardRequest: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  const jobBoard = Object.keys(jobBoardHandlers).find(key => url.includes(key));
  if (!jobBoard) {
    res.status(400).json({ error: 'Job board não suportado' });
    return;
  }

  const handler = jobBoardHandlers[jobBoard];
  await handler(req, res, next);
};

export { handleJobBoardRequest };