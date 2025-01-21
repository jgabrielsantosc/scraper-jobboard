import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ExpressHandler } from '../../types/types';

interface JobAttributes {
  title: string;
  slug: string;
  description: string;
  salary: string;
  created_at: string;
  contracting_regime: string;
  location: string;
  working_journey: string;
  educational_level: string;
  educational_level_status: string;
  tech_skills: string[];
  complementary_courses: string[];
  courses: string[];
  benefits_verbose: string[];
  languages_verbose: string[];
  available_for_homeoffice: boolean;
  hibrida: boolean;
  presencial: boolean;
  remoto: boolean;
  required_experience: boolean;
}

interface JobRelationships {
  company: {
    data: {
      id: string;
      type: string;
    }
  };
  customer: {
    data: {
      id: string;
      type: string;
    } | null;
  };
  level_of_interest: {
    data: {
      id: string;
      type: string;
    }
  };
  area_of_interests: {
    data: Array<{
      id: string;
      type: string;
    }>
  };
  experience_tag: {
    data: {
      id: string;
      type: string;
    }
  };
}

interface CompanyData {
  id: string;
  type: string;
  attributes: {
    name: string;
    subdomain: string;
  };
}

interface CustomerData {
  id: string;
  type: string;
  attributes: {
    trading_name: string;
  };
}

interface LevelOfInterest {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

interface AreaOfInterest {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

interface ExperienceTag {
  id: string;
  type: string;
  attributes: {
    tags: string[];
  };
}

interface CustomerContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ApiResponse {
  data: {
    id: string;
    type: string;
    attributes: JobAttributes;
    relationships: JobRelationships;
    meta: {
      customer_contact: CustomerContact | null;
    };
  };
  included: Array<CompanyData | CustomerData | LevelOfInterest | AreaOfInterest | ExperienceTag>;
}

export const jobAblerHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    console.log('Processando URL:', url);
    
    const urlObj = new URL(url);
    const slug = urlObj.hostname.split('.')[0];
    const jobSlug = url.split('/').pop() || '';

    const apiUrl = `https://${slug}.abler.com.br/api_v/v1/vagas/${jobSlug}.json`;
    console.log('URL da API:', apiUrl);

    const response = await axios.get<ApiResponse>(apiUrl);
    const { data: jobData, included } = response.data;

    const levelOfInterest = included.find(
      (item): item is LevelOfInterest =>
        item.type === 'level_of_interest' &&
        item.id === jobData.relationships.level_of_interest.data.id
    );

    const areasOfInterest = jobData.relationships.area_of_interests.data.map(areaRef => 
      included.find(
        (item): item is AreaOfInterest =>
          item.type === 'area_of_interest' &&
          item.id === areaRef.id
      )
    ).filter((area): area is AreaOfInterest => area !== undefined);

    const experienceTag = included.find(
      (item): item is ExperienceTag =>
        item.type === 'experience_tag' &&
        item.id === jobData.relationships.experience_tag.data.id
    );

    const jobInfo = {
      id: jobData.id,
      title: jobData.attributes.title,
      jobType: jobData.attributes.contracting_regime,
      location: jobData.attributes.location,
      description: jobData.attributes.description,
      salary: jobData.attributes.salary,
      created_at: jobData.attributes.created_at,
      working_journey: jobData.attributes.working_journey,
      educational_level: {
        level: jobData.attributes.educational_level,
        status: jobData.attributes.educational_level_status
      },
      tech_skills: jobData.attributes.tech_skills,
      complementary_courses: jobData.attributes.complementary_courses,
      courses: jobData.attributes.courses,
      benefits: jobData.attributes.benefits_verbose,
      languages: jobData.attributes.languages_verbose,
      work_model: {
        remote: jobData.attributes.remoto,
        hybrid: jobData.attributes.hibrida,
        on_site: jobData.attributes.presencial,
        home_office_available: jobData.attributes.available_for_homeoffice
      },
      experience: {
        required: jobData.attributes.required_experience,
        level: levelOfInterest?.attributes.name,
        areas: areasOfInterest.map(area => area.attributes.name),
        tags: experienceTag?.attributes.tags || []
      }
    };

    console.log('Informações da vaga extraídas com sucesso');
    res.json(jobInfo);
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes da resposta:', error.response?.data);
    }
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
};