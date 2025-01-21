import { Router } from 'express';
import { listarVagas, processarVaga } from '../controllers/vaga.controller';

const router = Router();

router.get('/', listarVagas);
router.post('/processar', processarVaga);

export default router; 