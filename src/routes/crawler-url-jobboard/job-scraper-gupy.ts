import { chromium, Page } from 'playwright';
import axios from 'axios';

interface GupyJob {
  id: number;
  name: string;
  careerPageId: number;
  publishedAt: string;
  expiresAt: string;
}

interface GupyResponse {
  data: GupyJob[];
  total: number;
  page: number;
  totalPages: number;
}

export const scraperJobGupy = async (url: string): Promise<string[]> => {
  try {
    console.log('Acessando página da Gupy:', url);
    
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.gupy\.io/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Usa a API da Gupy diretamente
    const response = await axios.get<GupyResponse>(`https://${companyName}.gupy.io/api/job-search`, {
      params: {
        jobBoardSource: 'gupy_public_page',
        page: 1,
        limit: 100
      }
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      console.warn('Formato de resposta inesperado da API da Gupy:', response.data);
      return [];
    }

    // Mapeia os resultados para URLs completas
    const jobUrls = response.data.data.map(job => 
      `https://${companyName}.gupy.io/jobs/${job.id}?jobBoardSource=gupy_public_page`
    );

    return [...new Set(jobUrls)]; // Remove duplicatas
  } catch (error) {
    console.error('Erro ao extrair URLs da Gupy:', error);
    
    // Se falhar com a API, tenta o método de scraping
    return await scrapGupyPage(url);
  }
};

async function scrapGupyPage(url: string): Promise<string[]> {
  const jobUrls: string[] = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Tentando método alternativo de scraping...');
    
    await page.goto(url, { timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 60000 });
    } catch (error) {
      console.log('Timeout no networkidle, tentando continuar mesmo assim');
    }

    // Aguarda pelo menos um dos seletores aparecer
    await page.waitForSelector([
      '[data-testid="job-list__listitem-href"]',
      '.job-list__listitem-href',
      '.job-list a'
    ].join(','), { timeout: 60000 });

    while (true) {
      const newUrls = await coletarUrlsDaPagina(page);
      jobUrls.push(...newUrls);

      const botaoProxima = page.locator('[data-testid="pagination-next-button"]');
      const botaoProximaDesabilitado = await botaoProxima.getAttribute('disabled');

      if (botaoProximaDesabilitado === null) {
        await botaoProxima.click();
        try {
          await page.waitForLoadState('networkidle', { timeout: 30000 });
        } catch (error) {
          console.log('Timeout ao aguardar próxima página, continuando...');
          await page.waitForTimeout(2000);
        }
      } else {
        break;
      }
    }

    return [...new Set(jobUrls)]; // Remove duplicatas
  } catch (error) {
    console.error('Erro ao fazer scraping da página da Gupy:', error);
    return [];
  } finally {
    await browser.close();
  }
}

async function coletarUrlsDaPagina(page: Page): Promise<string[]> {
  const baseUrl = new URL(page.url()).origin;
  return page.evaluate((baseUrl) => {
    const seletores = [
      '[data-testid="job-list__listitem-href"]',
      '.job-list__listitem-href',
      '.job-list a'
    ];
    
    const links = document.querySelectorAll(seletores.join(','));
    return Array.from(links).map(link => {
      const href = link.getAttribute('href');
      return href ? new URL(href, baseUrl).href : null;
    }).filter(Boolean) as string[];
  }, baseUrl);
}