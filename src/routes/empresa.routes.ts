import { Router } from 'express';
import { listarEmpresas, extrairUrlsVagas, processarVagas } from '../controllers/empresa.controller';

const router = Router();

router.get('/', listarEmpresas);
router.get('/:id/vagas/extrair-urls', extrairUrlsVagas);
router.get('/:id/vagas/processar', processarVagas);

export default router; 