import { Router } from 'express';
import { listarVagas, processarVaga } from '../controllers/vaga.controller';
import { handleJobDetailsRequest } from './scraper-job/unified-job-details';
import { jobAIAnalyzerHandler } from './scraper-job-ai/job-ai-analyzer';

const router = Router();

router.get('/', listarVagas);
router.post('/processar', processarVaga);

// Rota para extrair detalhes básicos de uma vaga
router.post('/detalhes', handleJobDetailsRequest);

// Rota para extrair detalhes com IA
router.post('/analise-ia', jobAIAnalyzerHandler);

export default router; 