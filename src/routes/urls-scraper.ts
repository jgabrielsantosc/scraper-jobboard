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

const jobBoardScrapers: Record<string, JobBoardScraper> = {
    'gupy': (req, res, next) => scraperJobGupy(req.body.url)
      .then(result => { res.json(result); return; }) // Adiciona return
      .catch(next),
    'abler': scraperJobAbler,
    'lever': (req, res, next) => scraperJobLever(req.body.url)
      .then(result => { res.json(result); return; }) // Adiciona return
      .catch(next),
    'inhire': scraperJobInhire,
    'quickin': scraperJobQuickin,
    'solides': (req, res, next) => scraperJobSolides(req.body.url)
      .then(result => { res.json(result); return; }) // Adiciona return
      .catch(next),
    'workable': scraperJobWorkable,
    'greenhouse': (req, res, next) => scraperJobGreenhouse(req.body.url)
      .then(result => { res.json(result); return; }) // Adiciona return
      .catch(next),
  };

export const unifiedUrlScraper: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  const jobBoard = Object.keys(jobBoardScrapers).find(key => url.includes(key));
  
  if (!jobBoard) {
    res.status(400).json({ error: 'Job board não suportado' });
    return;
  }

  const handler = jobBoardScrapers[jobBoard];
  await handler(req, res, next);
};
