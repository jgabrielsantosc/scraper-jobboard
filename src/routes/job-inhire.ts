import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ExpressHandler } from '../types';

async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export const jobInhireHandler: ExpressHandler = async (
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
      ignoreHTTPSErrors: true,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo',
      viewport: { width: 1280, height: 720 },
      locale: 'pt-BR',
    });

    // Técnicas anti-detecção
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    page = await context.newPage();

    // Capturar logs e erros
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err));

    console.log('Navegando para a URL:', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    console.log('Página carregada');

    await randomDelay();

    // Aguarda um seletor que indica que o conteúdo foi carregado
    const contentSelector = '#root';
    await page.waitForSelector(contentSelector, { state: 'attached', timeout: 120000 });
    console.log('Conteúdo principal disponível');

    await randomDelay();

    // Simula comportamento humano
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await randomDelay();

    // Avalia o conteúdo da página
    const content = await page.evaluate(() => {
      const element = document.querySelector('#root');
      return element ? (element as HTMLElement).innerText : '';
    });

    // Processa o conteúdo
    const cleanContent = content.trim();

    // Retorna o conteúdo
    res.json({
      content: cleanContent,
      formattedContent: cleanContent.split('\n'),
    });

    console.log('Conteúdo encontrado:', cleanContent.substring(0, 100) + '...');
  } catch (error: any) {
    console.error('Erro ao coletar informações da vaga:', error);
    if (page) {
      console.log('Capturando screenshot e conteúdo da página...');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
    }
    res.status(500).json({
      error: 'Erro ao coletar informações da vaga',
      details: error.message,
      stack: error.stack,
    });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};