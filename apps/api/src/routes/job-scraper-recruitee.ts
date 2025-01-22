import axios from 'axios';

interface RecruiteeOffer {
  id: number;
  title: string;
  careers_url: string;
  status: string;
  department: {
    id: number;
    name: string;
  };
  location: string;
  description: string;
  requirements: string;
}

interface RecruiteeResponse {
  offers: RecruiteeOffer[];
}

export const scraperJobRecruitee = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.recruitee\.com/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca a lista de vagas através da API
    const apiUrl = `https://${companyName}.recruitee.com/api/offers/`;
    console.log('Buscando vagas em:', apiUrl);
    
    const response = await axios.get<RecruiteeResponse>(apiUrl);
    
    if (!response.data?.offers) {
      console.log('Nenhuma vaga encontrada na resposta');
      return [];
    }

    // Filtra apenas vagas publicadas e extrai suas URLs
    const jobUrls = response.data.offers
      .filter(offer => offer.status === 'published')
      .map(offer => offer.careers_url)
      .filter(Boolean);

    console.log(`Encontradas ${jobUrls.length} vagas publicadas para ${companyName}`);

    return jobUrls;

  } catch (error) {
    console.error(`Erro ao buscar vagas do Recruitee:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Resposta da API:', error.response?.data);
    }
    throw error;
  }
}; 