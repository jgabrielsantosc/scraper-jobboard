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
      headless: true
    });

    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo',
      viewport: { width: 1280, height: 720 },
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    page = await context.newPage();

    // Add event listeners
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
    page.on('response', response => {
      if (!response.ok()) {
        console.error(`Network error: ${response.url()} status=${response.status()}`);
      }
    });

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    await randomDelay();

    // Capture screenshot after navigation
    await page.screenshot({ path: 'after-goto.png', fullPage: true });

    console.log('Esperando o seletor a[data-sentry-element="NavLink"]...');
    await page.waitForSelector('a[data-sentry-element="NavLink"]', { state: 'visible', timeout: 60000 });

    await randomDelay();

    // Capture page content
    const pageContent = await page.content();
    console.log('Page Content:', pageContent);

    const jobUrls = await page.$$eval(
      'a[data-sentry-element="NavLink"]',
      (links, baseUrl) => links.map(link => new URL(link.getAttribute('href') || '', baseUrl).href),
      url
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
    res.status(500).json({ error: 'Erro ao coletar informações das vagas', details: error.message, stack: error.stack });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};