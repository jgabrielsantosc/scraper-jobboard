import fs from 'fs';
import axios from 'axios';
import { GreenhouseJob, GreenhouseJobsResponse } from '../src/types/greenhouse';

interface JobUrl {
  url: string;
  jobId: number;
  company: string;
}

interface GreenhouseTestResult {
  company: string;
  baseUrl: string;
  status: 'success' | 'error';
  jobsFound: number;
  jobsDetails: JobTestResult[];
  processingTime: number;
  errorMessage?: string;
}

interface JobTestResult {
  jobId: string;
  status: 'success' | 'error';
  processingTime: number;
  errorMessage?: string;
}

async function extractSlug(url: string): Promise<string> {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname.replace(/\/$/, '');
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

async function getJobsForCompany(url: string): Promise<GreenhouseTestResult & { jobUrls: JobUrl[] }> {
  const startTime = Date.now();
  const result: GreenhouseTestResult & { jobUrls: JobUrl[] } = {
    company: '',
    baseUrl: url,
    status: 'error',
    jobsFound: 0,
    jobsDetails: [],
    processingTime: 0,
    jobUrls: []
  };

  try {
    const slug = await extractSlug(url);
    result.company = slug;

    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
    const response = await axios.get<GreenhouseJobsResponse>(apiUrl);

    if (!response.data || !response.data.jobs) {
      throw new Error('Resposta da API inválida');
    }

    result.jobsFound = response.data.jobs.length;
    result.status = 'success';
    
    result.jobUrls = response.data.jobs.map(job => ({
      url: job.absolute_url,
      jobId: job.id,
      company: slug
    }));

    const jobsToTest = response.data.jobs.slice(0, 3);
    for (const job of jobsToTest) {
      const jobResult = await testJobExtraction(slug, job.id.toString());
      result.jobsDetails.push(jobResult);
    }

  } catch (error) {
    result.status = 'error';
    result.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  result.processingTime = Date.now() - startTime;
  return result;
}

async function testJobExtraction(slug: string, jobId: string): Promise<JobTestResult> {
  const startTime = Date.now();
  const result: JobTestResult = {
    jobId,
    status: 'error',
    processingTime: 0
  };

  try {
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs/${jobId}`;
    const response = await axios.get<GreenhouseJob>(apiUrl);

    if (!response.data) {
      throw new Error('Resposta da API inválida');
    }

    result.status = 'success';
  } catch (error) {
    result.status = 'error';
    result.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  result.processingTime = Date.now() - startTime;
  return result;
}

async function runGreenhouseTests() {
  const results: Array<GreenhouseTestResult & { jobUrls: JobUrl[] }> = [];
  const companies = JSON.parse(fs.readFileSync('./testes/greenhouse.json', 'utf-8'));
  const allJobUrls: JobUrl[] = [];

  console.log('Iniciando testes do Greenhouse...\n');

  for (const company of companies) {
    console.log(`Testando empresa: ${company.url}`);
    const result = await getJobsForCompany(company.url);
    results.push(result);

    if (result.jobUrls.length > 0) {
      allJobUrls.push(...result.jobUrls);
    }

    console.log(`Status: ${result.status}`);
    console.log(`Vagas encontradas: ${result.jobsFound}`);
    console.log(`Tempo de processamento: ${result.processingTime}ms`);
    if (result.errorMessage) {
      console.log(`Erro: ${result.errorMessage}`);
    }
    console.log('-------------------\n');
  }

  const report = {
    totalCompanies: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    totalJobsFound: results.reduce((acc, r) => acc + r.jobsFound, 0),
    averageProcessingTime: results.reduce((acc, r) => acc + r.processingTime, 0) / results.length,
    companiesResults: results
  };

  fs.writeFileSync(
    './testes/greenhouse-results.json',
    JSON.stringify(report, null, 2)
  );

  fs.writeFileSync(
    './testes/greenhouse-jobs-urls.json',
    JSON.stringify({
      total: allJobUrls.length,
      jobs: allJobUrls
    }, null, 2)
  );

  console.log('\nTeste concluído!');
  console.log(`Total de empresas testadas: ${report.totalCompanies}`);
  console.log(`Empresas com sucesso: ${report.successful}`);
  console.log(`Empresas com erro: ${report.failed}`);
  console.log(`Total de vagas encontradas: ${report.totalJobsFound}`);
  console.log(`Tempo médio de processamento: ${report.averageProcessingTime.toFixed(2)}ms`);
  console.log(`\nURLs das vagas salvas em: greenhouse-jobs-urls.json`);
}

runGreenhouseTests().catch(console.error); 