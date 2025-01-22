import { Request, Response, NextFunction } from 'express';
import { ExpressHandler } from '../types';
import { jobInhireHandler } from './job-inhire';
import { jobGupyHandler } from './job-gupy';
import { jobAblerHandler } from './job-abler';
import { jobLeverHandler } from './job-lever';
import { jobQuickinHandler } from './job-quickin';
import { jobSolidesHandler } from './job-solides';
import { jobGreenhouseHandler } from './job-greenhouse';
import { jobWorkableHandler } from './job-workable';
import { jobRecruteiHandler } from './job-recrutei';
import { jobRecrutHandler } from './job-recrut';
import { jobBreezyHandler } from './job-breezy';
import { jobFactorialHandler } from './job-factorial';
import { jobEnliztHandler } from './job-enlizt';
import { jobBambooHandler } from './job-bamboo';
import { jobWorkdayHandler } from './job-workday';
import { jobHireroomHandler } from './job-hireroom';
import { jobPandapeHandler } from './job-pandape';
import { jobIcimsHandler } from './job-icims';
import { jobRecruiteeHandler } from './job-recruitee';
import { validateApiKey } from '../middleware/auth'
import { apiLimiter } from '../middleware/rate-limit'

// Wrapper para autenticação e rate limiting
const withAuth = (handler: ExpressHandler): ExpressHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validateApiKey(req, res, async () => {
        await apiLimiter(req, res, async () => {
          await handler(req, res, next)
        })
      })
    } catch (error) {
      next(error)
    }
  }
}

// Mapeamento de URLs para handlers com autenticação
const jobBoardHandlers: { [key: string]: ExpressHandler } = {
  'inhire.app': withAuth(jobInhireHandler),
  'gupy.io': withAuth(jobGupyHandler),
  'abler': withAuth(jobAblerHandler),
  'lever.co': withAuth(jobLeverHandler),
  'quickin': withAuth(jobQuickinHandler),
  'solides': withAuth(jobSolidesHandler),
  'greenhouse.io': withAuth(jobGreenhouseHandler),
  'workable.com': withAuth(jobWorkableHandler),
  'recrutei.com.br': withAuth(jobRecruteiHandler),
  'recrut.ai': withAuth(jobRecrutHandler),
  'breezy.hr': withAuth(jobBreezyHandler),
  'factorialhr': withAuth(jobFactorialHandler),
  'enlizt.me': withAuth(jobEnliztHandler),
  'bamboohr': withAuth(jobBambooHandler),
  'myworkdayjobs.com': withAuth(jobWorkdayHandler),
  'hiringroom.com': withAuth(jobHireroomHandler),
  'pandape.infojobs.com.br': withAuth(jobPandapeHandler),
  'icims.com': withAuth(jobIcimsHandler),
  'recruitee.com': withAuth(jobRecruiteeHandler),
};

// Função para identificar o job board e chamar o handler apropriado
export const handleJobDetailsRequest: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  console.log(`Processando URL: ${url}`);

  const jobBoard = Object.keys(jobBoardHandlers).find(key => url.includes(key));
  if (!jobBoard) {
    res.status(400).json({ error: 'Job board não suportado' });
    return;
  }

  console.log(`Job board identificado: ${jobBoard}`);

  try {
    const handler = jobBoardHandlers[jobBoard];
    await handler(req, res, next);
  } catch (error) {
    console.error(`Erro ao processar a vaga do ${jobBoard}:`, error);
    res.status(500).json({ error: `Erro ao processar a vaga do ${jobBoard}` });
  }
};
