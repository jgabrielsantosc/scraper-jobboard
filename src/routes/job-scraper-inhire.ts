import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, BrowserContext, Page, devices } from 'playwright';
import { ExpressHandler } from '../types';
// Removendo a importação e uso do plugin stealth, pois não é compatível com Playwright

async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  await new Promise(resolve => setTimeout(resolve, delay));
}

export const scraperJobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    console.log('Iniciando o navegador...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const iPhone = devices['iPhone 11'];
    context = await browser.newContext({
      ...iPhone,
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      locale: 'pt-BR',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    page = await context.newPage();

    const jobUrls = await scrapeJobsLogic(page, url);

    res.json(jobUrls);

    console.log('Capturando screenshot final...');
    await page.screenshot({ path: 'final-screenshot.png', fullPage: true });

    if (jobUrls.length === 0) {
      console.log('Tentando abordagem alternativa para encontrar vagas...');
      const alternativeJobUrls = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        return allLinks
          .filter(link => link.href.includes('/vagas/'))
          .map(link => link.href);
      });
      console.log(`Vagas encontradas (abordagem alternativa): ${alternativeJobUrls.length}`);
      if (alternativeJobUrls.length > 0) {
        jobUrls.push(...alternativeJobUrls);
      }
    }

    if (!(await page.$('#root'))) {
      console.log('Elemento #root não encontrado. Tentando abordagem alternativa...');
      const bodyContent = await page.evaluate(() => document.body.innerText);
      console.log('Conteúdo do body:', bodyContent);
      // Implemente uma lógica alternativa para extrair informações, se possível
    }

  } catch (error: any) {
    console.error('Erro ao coletar informações das vagas:', error);
    if (page) {
      console.log('Capturando screenshot e conteúdo da página...');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
    }
    res.status(500).json({ error: 'Erro ao coletar informações das vagas', details: error.message, stack: error.stack });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};

async function scrapeJobsLogic(page: Page, url: string): Promise<string[]> {
  console.log(`Navegando para a URL: ${url}`);
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Página carregada');

  if (response) {
    console.log('Status da resposta:', response.status());
    console.log('URL final:', response.url());
  }

  if (page.url() !== url) {
    console.log(`A página foi redirecionada para: ${page.url()}`);
  }

  await randomDelay(10000, 15000);

  // Adicionando o código de rolagem aqui
  console.log('Aguardando carregamento completo...');
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  console.log('Carregamento completo');

  console.log('Procurando links de vagas...');
  const jobUrls = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .filter(link => {
        const href = link.getAttribute('href');
        return href && href.match(/\/vagas\/[a-f0-9-]+\/[^\/]+$/);
      })
      .map(link => {
        const href = link.getAttribute('href');
        return href ? new URL(href, window.location.href).href : null;
      })
      .filter(url => url !== null) as string[];
  });

  console.log(`Total de vagas encontradas: ${jobUrls.length}`);

  if (jobUrls.length === 0) {
    console.log('Nenhuma vaga encontrada. Capturando mais informações...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Texto do corpo da página:', bodyText.substring(0, 1000) + '...');
    
    console.log('Tentando encontrar elementos que possam conter informações de vagas...');
    const possibleJobElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, section, article'));
      return elements
        .filter(el => (el as HTMLElement).innerText.toLowerCase().includes('vaga') || (el as HTMLElement).innerText.toLowerCase().includes('oportunidade'))
        .map(el => (el as HTMLElement).innerText)
        .join('\n\n');
    });
    console.log('Possíveis elementos de vagas:', possibleJobElements);
  }

  return jobUrls;
}