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
    });

    page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    console.log('Esperando o seletor a[data-sentry-element="NavLink"]...');
    await page.waitForSelector('a[data-sentry-element="NavLink"]', { timeout: 60000 });

    const jobUrls = await page.$$eval('a[data-sentry-element="NavLink"]', 
      (links, baseUrl) => links.map(link => new URL(link.getAttribute('href') || '', baseUrl).href), url
    );

    console.log(`Total de vagas encontradas: ${jobUrls.length}`);

    res.json(jobUrls);

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