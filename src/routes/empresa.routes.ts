import { Router } from 'express';
import { 
  listarEmpresas, 
  buscarEmpresaPorId,
  criarEmpresa,
  atualizarEmpresa,
  excluirEmpresa,
  processarVagasEmpresa,
  extrairUrlsEmpresa,
  extrairVagasEmpresa
} from '../controllers/empresa.controller';

const router = Router();

// Rotas CRUD básicas
router.get('/', listarEmpresas);
router.get('/:id', buscarEmpresaPorId);
router.post('/', criarEmpresa);
router.put('/:id', atualizarEmpresa);
router.delete('/:id', excluirEmpresa);

// Rotas de extração
router.post('/:id/extrair-urls', extrairUrlsEmpresa);
router.post('/:id/extrair-vagas', extrairVagasEmpresa);
router.post('/:id/processar-vagas', processarVagasEmpresa);

export default router; 