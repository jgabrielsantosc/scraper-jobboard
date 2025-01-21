import { Request, Response, NextFunction } from 'express';
import { ExpressHandler } from '../../types/types';
import { scraperJobGupy } from './job-scraper-gupy';
import { scraperJobAblerHandler as scraperJobAbler } from './job-scraper-abler';
import { scraperJobLever } from './job-scraper-lever';
import { scraperJobInhire } from './job-scraper-inhire';
import { scraperJobQuickinHandler as scraperJobQuickin } from './job-scraper-quickin';
import { scraperJobSolides } from './job-scraper-solides';
import { scraperJobWorkableHandler as scraperJobWorkable } from './job-scraper-workable';
import { scraperJobGreenhouse } from './job-scraper-greenhouse';
import { scraperJobRecruitei } from './job-scraper-recruitei';
import { scraperJobCompleo } from './job-scraper-compleo';
import { scraperJobRecrut } from './job-scraper-recrut';
import { scraperJobBreezy } from './job-scraper-breezy';
import { scraperJobFactorial } from './job-scraper-factorial';
import { scraperJobEnlizt } from './job-scraper-enlizt';
import { scraperJobBamboo } from './job-scraper-bamboo';
import { scraperJobWorkday } from './job-scraper-workday';
import { scraperJobHireroom } from './job-scraper-hireroom';
import { scraperJobPandape } from './job-scraper-pandape';
import { scraperJobIcims } from './job-scraper-icims';
import { scraperJobRecruitee } from './job-scraper-recruitee';

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

const greenhouseWrapper = (url: string) => {
  return new Promise((resolve, reject) => {
    const req = { body: { url } } as Request;
    const res = {
      json: (data: any) => resolve(data),
      status: (code: number) => ({
        json: (data: any) => reject(data)
      })
    } as unknown as Response;

    scraperJobGreenhouse(req, res, () => {});
  });
};

const jobBoardScrapers: Record<string, JobBoardScraper> = {
    'gupy.io': createScraperWrapper(scraperJobGupy),
    'abler': scraperJobAbler,
    'lever': createScraperWrapper(scraperJobLever),
    'inhire': createScraperWrapper(scraperJobInhire),
    'quickin': scraperJobQuickin,
    'solides': createScraperWrapper(scraperJobSolides),
    'workable': scraperJobWorkable,
    'greenhouse': createScraperWrapper(greenhouseWrapper),
    'recrutei.com.br': createScraperWrapper(scraperJobRecruitei),
    'compleo.com.br': createScraperWrapper(scraperJobCompleo),
    'recrut.ai': createScraperWrapper(scraperJobRecrut),
    'breezy.hr': createScraperWrapper(scraperJobBreezy),
    'factorialhr': createScraperWrapper(scraperJobFactorial),
    'enlizt.me': createScraperWrapper(scraperJobEnlizt),
    'bamboohr': createScraperWrapper(scraperJobBamboo),
    'myworkdayjobs.com': createScraperWrapper(scraperJobWorkday),
    'hiringroom.com': createScraperWrapper(scraperJobHireroom),
    'pandape.infojobs.com.br': createScraperWrapper(scraperJobPandape),
    'icims.com': createScraperWrapper(scraperJobIcims),
    'recruitee.com': createScraperWrapper(scraperJobRecruitee),
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

    console.log(`URL recebida: ${url}`);
    console.log(`Job board identificado: ${jobBoard}`);
    
    try {
        const handler = jobBoardScrapers[jobBoard];
        await handler(req, res, next);
    } catch (error) {
        console.error(`Erro ao processar a URL ${url} para o job board ${jobBoard}:`, error);
        res.status(500).json({ error: 'Erro interno ao processar a requisição' });
    }
};
