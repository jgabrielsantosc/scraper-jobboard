import axios from 'axios';

interface BambooLocation {
  city: string | null;
  state: string | null;
  country: string;
}

interface BambooJob {
  id: string;
  jobOpeningName: string;
  departmentId: string;
  departmentLabel: string;
  employmentStatusLabel: string;
  location: BambooLocation;
  isRemote: boolean;
  locationType: string;
}

interface BambooListResponse {
  meta: {
    totalCount: number;
  };
  result: BambooJob[];
}

export const scraperJobBamboo = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.bamboohr\.com/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca a lista de vagas
    const listUrl = `https://${companyName}.bamboohr.com/careers/list/`;
    const response = await axios.get<BambooListResponse>(listUrl);
    
    // Verifica se há dados válidos
    if (!response.data?.result) {
      throw new Error('Dados inválidos retornados pela API');
    }
    
    // Constrói as URLs das vagas
    return response.data.result.map(job => 
      `https://${companyName}.bamboohr.com/careers/${job.id}`
    );

  } catch (error) {
    console.error(`Erro ao buscar vagas do BambooHR:`, error);
    throw error;
  }
}; 