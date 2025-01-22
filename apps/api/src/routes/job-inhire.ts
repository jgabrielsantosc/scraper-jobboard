import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

interface InhireJobDetails {
  tenantName: string;
  description: string;
  displayName: string;
  workplaceType: string;
  location: string;
  // Adicione outros campos conforme necessário
}

export const jobInhireHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  try {
    // Extrair tenant e jobId da URL
    const urlMatch = url.match(/https?:\/\/([^.]+)\.inhire\.app\/vagas\/([^/]+)/);
    if (!urlMatch) {
      throw new Error('URL inválida');
    }

    const [, tenant, jobId] = urlMatch;

    const response = await axios.get<InhireJobDetails>(
      `https://api.inhire.app/job-posts/public/pages/${jobId}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Tenant': tenant
        }
      }
    );

    const { data } = response;

    // Formatar o conteúdo da vaga em markdown
    const jobContent = `
# ${data.displayName}

${data.description}

**Localização:** ${data.location}
**Tipo de Trabalho:** ${data.workplaceType}
**Empresa:** ${data.tenantName}
    `.trim();

    res.json({ content: jobContent });

  } catch (error: any) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({
      error: 'Erro ao coletar informações da vaga',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};