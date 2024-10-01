import { test, expect } from '@playwright/test';
import axios from 'axios';

test('extrair URLs das vagas Solides', async ({ page }) => {
  const url = 'https://bwtech.vagas.solides.com.br/';

  // Extrair o nome da empresa da URL
  const companyName = new URL(url).hostname.split('.')[0];

  try {
    // Buscar as vagas da primeira página para obter o número total de páginas
    const firstPageResponse = await axios.get(
      `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=1&slug=${companyName}`
    );

    const totalPages = firstPageResponse.data.data.totalPages;
    const allJobs: any[] = [];

    // Buscar todas as páginas de vagas
    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(
        `https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=${page}&slug=${companyName}`
      );
      allJobs.push(...response.data.data.data);
    }

    const baseUrl = `https://${companyName}.vagas.solides.com.br/vaga/`;
    const jobUrls = allJobs.map(job => `${baseUrl}${job.id}`);

    console.log('URLs das vagas:', jobUrls);

    // Adicione mais asserções específicas
    expect(jobUrls.length).toBeGreaterThan(0);
    expect(jobUrls[0]).toContain(baseUrl);

  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    throw error; // Re-lança o erro para que o teste falhe
  }
});