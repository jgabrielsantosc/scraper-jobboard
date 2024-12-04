import fs from 'fs';
import axios from 'axios';
import { GreenhouseJob } from '../src/types/greenhouse';
import { convertHtmlToMarkdown } from '../src/utils/html-to-markdown';

interface JobData {
  title: string;
  location: string | null;
  content: string;
  departments: string[];
  offices: string[];
  metadata: any[] | null;
  updated_at: string;
  requisition_id: string | null;
  internal_job_id: number;
  data_compliance?: {
    type: string;
    requires_consent: boolean;
    requires_processing_consent: boolean;
    requires_retention_consent: boolean;
    retention_period: number | null;
    demographic_data_consent_applies: boolean;
  }[];
  education?: string;
  absolute_url: string;
}

interface JobTestResult {
  url: string;
  jobId: number;
  company: string;
  status: 'success' | 'error';
  processingTime: number;
  errorMessage?: string;
  data?: JobData;
}

interface TestReport {
  totalJobs: number;
  successful: number;
  failed: number;
  averageProcessingTime: number;
  jobsWithNoContent: number;
  jobsWithNoDepartments: number;
  jobsWithNoOffices: number;
  jobsRequiringConsent: number;
  jobsWithEducationInfo: number;
  companiesProcessed: string[];
  errors: Array<{
    url: string;
    company: string;
    error: string;
  }>;
  results: JobTestResult[];
}

async function extractJobInfo(jobUrl: JobTestResult): Promise<JobTestResult> {
  const startTime = Date.now();
  const result: JobTestResult = {
    ...jobUrl,
    status: 'error',
    processingTime: 0
  };

  try {
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${jobUrl.company}/jobs/${jobUrl.jobId}`;
    const response = await axios.get<GreenhouseJob>(apiUrl);

    if (!response.data) {
      throw new Error('Resposta da API inválida');
    }

    result.status = 'success';
    result.data = {
      title: response.data.title,
      location: response.data.location?.name || null,
      content: convertHtmlToMarkdown(response.data.content || ''),
      departments: response.data.departments?.map(dept => dept.name) || [],
      offices: response.data.offices?.map(office => office.name) || [],
      metadata: response.data.metadata,
      updated_at: response.data.updated_at,
      requisition_id: response.data.requisition_id || null,
      internal_job_id: response.data.internal_job_id,
      data_compliance: response.data.data_compliance,
      education: response.data.education,
      absolute_url: response.data.absolute_url
    };

  } catch (error) {
    result.status = 'error';
    result.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  result.processingTime = Date.now() - startTime;
  return result;
}

async function runJobsTest() {
  console.log('Iniciando teste de extração das vagas...\n');

  // Lê o arquivo com as URLs das vagas
  const jobUrlsFile = JSON.parse(fs.readFileSync('./testes/greenhouse-jobs-urls.json', 'utf-8'));
  const jobs: JobTestResult[] = jobUrlsFile.jobs;
  const results: JobTestResult[] = [];

  console.log(`Total de vagas para processar: ${jobs.length}\n`);

  // Processa cada vaga
  for (const job of jobs) {
    console.log(`Processando vaga: ${job.url}`);
    const result = await extractJobInfo(job);
    results.push(result);

    // Log em tempo real
    console.log(`Status: ${result.status}`);
    if (result.status === 'success' && result.data) {
      console.log(`Título: ${result.data.title}`);
      console.log(`Departamentos: ${result.data.departments.join(', ') || 'Nenhum'}`);
    }
    if (result.errorMessage) {
      console.log(`Erro: ${result.errorMessage}`);
    }
    console.log('-------------------\n');
  }

  // Gera relatório
  const report: TestReport = {
    totalJobs: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    averageProcessingTime: results.reduce((acc, r) => acc + r.processingTime, 0) / results.length,
    jobsWithNoContent: results.filter(r => r.status === 'success' && (!r.data?.content || r.data.content.length === 0)).length,
    jobsWithNoDepartments: results.filter(r => r.status === 'success' && (!r.data?.departments || r.data.departments.length === 0)).length,
    jobsWithNoOffices: results.filter(r => r.status === 'success' && (!r.data?.offices || r.data.offices.length === 0)).length,
    jobsRequiringConsent: results.filter(r => r.status === 'success' && r.data?.data_compliance?.some(dc => dc.requires_consent)).length,
    jobsWithEducationInfo: results.filter(r => r.status === 'success' && r.data?.education).length,
    companiesProcessed: [...new Set(results.map(r => r.company))],
    errors: results
      .filter(r => r.status === 'error')
      .map(r => ({
        url: r.url,
        company: r.company,
        error: r.errorMessage || 'Erro desconhecido'
      })),
    results
  };

  // Salva resultados detalhados
  fs.writeFileSync(
    './testes/greenhouse-jobs-results.json',
    JSON.stringify(report, null, 2)
  );

  // Salva um resumo das vagas extraídas com sucesso
  const successfulJobs = results
    .filter(r => r.status === 'success' && r.data)
    .map(r => ({
      url: r.url,
      company: r.company,
      title: r.data?.title,
      location: r.data?.location,
      departments: r.data?.departments,
      updated_at: r.data?.updated_at
    }));

  fs.writeFileSync(
    './testes/greenhouse-jobs-summary.json',
    JSON.stringify(successfulJobs, null, 2)
  );

  // Log do relatório final
  console.log('\nTeste concluído!');
  console.log(`Total de vagas processadas: ${report.totalJobs}`);
  console.log(`Vagas processadas com sucesso: ${report.successful}`);
  console.log(`Vagas com erro: ${report.failed}`);
  console.log(`Tempo médio de processamento: ${report.averageProcessingTime.toFixed(2)}ms`);
  console.log(`Vagas sem conteúdo: ${report.jobsWithNoContent}`);
  console.log(`Vagas sem departamentos: ${report.jobsWithNoDepartments}`);
  console.log(`Empresas processadas: ${report.companiesProcessed.length}`);
  console.log('\nResultados salvos em:');
  console.log('- greenhouse-jobs-results.json (relatório completo)');
  console.log('- greenhouse-jobs-summary.json (resumo das vagas com sucesso)');
}

runJobsTest().catch(console.error); 