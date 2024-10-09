import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  let browser;
  let context;
  let page;

  try {
    console.log('Iniciando o navegador...');
    browser = await chromium.launch({
      headless: true,
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
    });

    page = await context.newPage();

    // Add event listeners
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
    page.on('request', request => console.log('>>', request.method(), request.url()));
    page.on('response', response => console.log('<<', response.status(), response.url()));

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Auto-scroll the page
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Wait for job listings to load
    await page.waitForSelector('li[data-sentry-element="JobPositionLi"]', { state: 'visible', timeout: 60000 });

    console.log('Procurando links de vagas...');
    const jobUrls = await page.$$eval('a[data-sentry-element="NavLink"]', (links, baseUrl) => {
      return links
        .map(link => link.getAttribute('href'))
        .filter((href): href is string => href !== null && href.startsWith('/vagas/'))
        .map(href => new URL(href, baseUrl).href);
    }, url);

    console.log(`Total de vagas encontradas: ${jobUrls.length}`);

    res.json(jobUrls);

  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);

    if (page) {
      console.log('Capturando screenshot e conteúdo da página...');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
    }

    res.status(500).json({ error: 'Erro ao coletar informações das vagas', details: (error as Error).message });
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
};