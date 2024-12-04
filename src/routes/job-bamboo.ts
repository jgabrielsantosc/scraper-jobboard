import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../types';

interface BambooJobDetail {
  jobOpening: {
    jobOpeningShareUrl: string;
    jobOpeningName: string;
    jobOpeningStatus: string;
    departmentId: string;
    departmentLabel: string;
    employmentStatusLabel: string;
    employeesTitle: string;
    location: {
      city: string | null;
      state: string | null;
      postalCode: string;
      addressCountry: string;
    };
    isRemote: boolean;
    locationType: string;
    description: string;
    compensation?: string;
    minimumExperience?: string;
    datePosted: string;
  };
}

interface BambooDetailResponse {
  meta: Record<string, unknown>;
  result: BambooJobDetail;
}

export const jobBambooHandler: ExpressHandler = async (
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
    // Extrai o ID da vaga e o nome da empresa da URL
    const matches = url.match(/https?:\/\/([^.]+)\.bamboohr\.com\/careers\/(\d+)/);
    if (!matches) {
      throw new Error('URL inválida');
    }

    const [, companyName, jobId] = matches;

    // Busca os detalhes da vaga
    const detailUrl = `https://${companyName}.bamboohr.com/careers/${jobId}/detail`;
    const response = await axios.get<BambooDetailResponse>(detailUrl);

    const { jobOpening } = response.data.result;

    // Formata a resposta
    const jobInfo = {
      title: jobOpening.jobOpeningName,
      status: jobOpening.jobOpeningStatus,
      department: jobOpening.departmentLabel,
      employment_type: jobOpening.employmentStatusLabel,
      level: jobOpening.employeesTitle,
      location: {
        city: jobOpening.location.city,
        state: jobOpening.location.state,
        country: jobOpening.location.addressCountry,
        postal_code: jobOpening.location.postalCode
      },
      is_remote: jobOpening.isRemote,
      location_type: jobOpening.locationType === '1' ? 'Remote' : 
                    jobOpening.locationType === '2' ? 'Hybrid' : 'On-site',
      description: jobOpening.description,
      compensation: jobOpening.compensation,
      minimum_experience: jobOpening.minimumExperience,
      posted_at: jobOpening.datePosted
    };

    res.json(jobInfo);

  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
}; 