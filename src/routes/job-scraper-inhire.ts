import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobInhireHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      timezoneId: 'America/Sao_Paulo',
      locale: 'pt-BR',
    });

    // Adicionar técnicas anti-detecção
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

    // Capturar logs de console e erros
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err));
    page.on('response', (response) => {
      if (!response.ok()) {
        console.log(`Network error: ${response.url()} status=${response.status()}`);
      }
    });

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

    // Esperar pelo seletor específico das vagas com tempo de espera maior
    await page.waitForSelector('li[data-sentry-element="JobPositionLi"]', {
      state: 'visible',
      timeout: 120000,
    });

    // Simular interações humanas
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 500);

    console.log('Procurando links de vagas...');
    const jobUrls = await page.evaluate((baseUrl) => {
      const links = Array.from(
        document.querySelectorAll('li[data-sentry-element="JobPositionLi"] a[data-sentry-element="NavLink"]')
      );
      return links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => href !== null && href.startsWith('/vagas/'))
        .map((href) => new URL(href, baseUrl).href);
    }, url);

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

    res.status(500).json({
      error: 'Erro ao coletar informações das vagas',
      details: error.message,
      stack: error.stack,
    });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};