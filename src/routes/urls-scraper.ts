import { Request, Response, NextFunction } from 'express';
import { ExpressHandler } from '../types';
import { scraperJobGupy } from './job-scraper-gupy';
import { scraperJobAblerHandler as scraperJobAbler } from './job-scraper-abler';
import { scraperJobLever } from './job-scraper-lever';
import { scraperJobInhireHandler as scraperJobInhire } from './job-scraper-inhire';
import { scraperJobQuickinHandler as scraperJobQuickin } from './job-scraper-quickin';
import { scraperJobSolides } from './job-scraper-solides';
import { scraperJobWorkableHandler as scraperJobWorkable } from './job-scraper-workable';
import { scraperJobGreenhouse } from './job-scraper-greenhouse';

type JobBoardScraper = ExpressHandler;

// Função auxiliar para criar um wrapper para scrapers que retornam Promises
const createScraperWrapper = (scraper: (url: string) => Promise<any>): JobBoardScraper => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await scraper(req.body.url);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
};

const jobBoardScrapers: Record<string, JobBoardScraper> = {
    'gupy.io': createScraperWrapper(scraperJobGupy),
    'abler': scraperJobAbler,
    'lever': createScraperWrapper(scraperJobLever),
    'inhire': scraperJobInhire, // Alterado de 'inhire.app' para 'inhire'
    'quickin': scraperJobQuickin,
    'solides': createScraperWrapper(scraperJobSolides),
    'workable': scraperJobWorkable,
    'greenhouse': createScraperWrapper(scraperJobGreenhouse),
};

export const unifiedUrlScraper: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { url } = req.body;

    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }

    const jobBoard = Object.keys(jobBoardScrapers).find(key => url.toLowerCase().includes(key));
    
    if (!jobBoard) {
        res.status(400).json({ error: 'Job board não suportado' });
        return;
    }

    console.log(`Job board identificado: ${jobBoard}`);
    const handler = jobBoardScrapers[jobBoard];
    await handler(req, res, next);
};
