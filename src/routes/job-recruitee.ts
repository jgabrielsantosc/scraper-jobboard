import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

interface RecruiteeOffer {
  id: number;
  title: string;
  careers_url: string;
  location: string;
  department: string;
  description: string;
  requirements: string;
  status: string;
}

interface RecruiteeResponse {
  offers: RecruiteeOffer[];
}

export const jobRecruiteeHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    // Extrai o nome da empresa e o slug da vaga da URL
    const matches = url.match(/https?:\/\/([^.]+)\.recruitee\.com\/o\/([^/]+)/);
    if (!matches) {
      throw new Error('URL inválida');
    }

    const [, companyName] = matches;

    // Busca todas as vagas da empresa
    const apiUrl = `https://${companyName}.recruitee.com/api/offers/`;
    const response = await axios.get<RecruiteeResponse>(apiUrl);

    // Encontra a vaga específica que corresponde à URL fornecida
    const jobInfo = response.data.offers.find(offer => offer.careers_url === url);

    if (!jobInfo) {
      res.status(404).json({ error: 'Vaga não encontrada' });
      return;
    }

    // Retorna as informações formatadas
    res.json({
      title: jobInfo.title,
      location: jobInfo.location,
      department: jobInfo.department,
      description: jobInfo.description,
      requirements: jobInfo.requirements
    });

  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
}; 