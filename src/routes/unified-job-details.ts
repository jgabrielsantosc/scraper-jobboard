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

// Mapeamento de URLs para handlers
const jobBoardHandlers: { [key: string]: ExpressHandler } = {
  'inhire': jobInhireHandler,
  'gupy': jobGupyHandler,
  'abler': jobAblerHandler,
  'lever': jobLeverHandler,
  'quickin': jobQuickinHandler,
  'solides': jobSolidesHandler,
  'greenhouse': jobGreenhouseHandler,
  'workable': jobWorkableHandler,
};

// Função para identificar o job board e chamar o handler apropriado
const handleJobDetailsRequest: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export { handleJobDetailsRequest };