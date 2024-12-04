import axios from 'axios';

interface InhireJob {
  status: string;
  jobId: string;
  careerPageId: string;
  displayName: string;
  workplaceType: string;
  location: string;
}

interface InhireResponse {
  tenantName: string;
  jobsPage: InhireJob[];
}

const extractTenantName = (url: string): string => {
  const match = url.match(/https?:\/\/([^.]+)\.inhire\.app/);
  return match ? match[1] : url;
};

const createJobUrl = (tenant: string, jobId: string, displayName: string): string => {
  const jobSlug = displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `https://${tenant}.inhire.app/vagas/${jobId}/${jobSlug}`;
};

export const scraperJobInhire = async (url: string): Promise<string[]> => {
  try {
    const tenant = extractTenantName(url);
    
    const response = await axios.get<InhireResponse>('https://api.inhire.app/job-posts/public/pages', {
      headers: {
        'Accept': 'application/json',
        'X-Tenant': tenant
      }
    });

    return response.data.jobsPage
      .filter(job => job.status === 'published')
      .map(job => createJobUrl(tenant, job.jobId, job.displayName));
    
  } catch (error) {
    console.error(`Erro ao buscar vagas da ${url}:`, error);
    throw error;
  }
};

export const scraperJobInhireHandler = scraperJobInhire;

// Exemplo de uso:
// const vagas = await scraperJobInhire('harpia');