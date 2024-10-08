import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ExpressHandler } from '../types';

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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    await randomDelay();

    await page.waitForSelector('body', { state: 'visible', timeout: 60000 });
    await page.waitForFunction(() => document.readyState === 'complete');

    await randomDelay();

    // Simular comportamento humano
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await randomDelay();

    console.log('Esperando o seletor .css-jswd32.eicjt3c5...');
    await page.waitForSelector('.css-jswd32.eicjt3c5', { timeout: 60000 });

    console.log('Extraindo informações das vagas...');
    const jobUrls = await page.$$eval('.css-jswd32.eicjt3c5 li a[data-sentry-element="NavLink"]', 
      (links, baseUrl) => links.map(link => `${baseUrl}${link.getAttribute('href')}`), url
    );
    
    console.log(`Total de vagas encontradas: ${jobUrls.length}`);
    console.log(JSON.stringify(jobUrls, null, 2));

    if (jobUrls.length === 0) {
      console.log('Nenhuma vaga encontrada. Capturando conteúdo da página...');
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
      res.status(404).json([]);
    } else {
      res.json(jobUrls);
    }
  } catch (error: any) {
    console.error('Erro ao coletar informações das vagas:', error);
    if (page) {
      console.log('Capturando screenshot e conteúdo da página...');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
    }
    res.status(500).json({ error: 'Erro ao coletar informações das vagas', details: error.message });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};