import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, Page } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('Iniciando o navegador...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo',
    });

    page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

    console.log('Aguardando carregamento da página...');
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => console.log('Timeout ao aguardar networkidle'));

    console.log('Esperando o seletor .css-jswd32.eicjt3c5...');
    await page.waitForSelector('.css-jswd32.eicjt3c5', { timeout: 60000 }).catch(() => console.log('Seletor não encontrado'));

    console.log('Rolando a página...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    console.log('Extraindo informações das vagas...');
    const jobUrls = await page.$$eval('.css-jswd32.eicjt3c5 li a[data-sentry-element="NavLink"]', (links, baseUrl) => 
      links.map(link => `${baseUrl}${link.getAttribute('href')}`), url
    );
    
    console.log(`Total de vagas encontradas: ${jobUrls.length}`);
    console.log(JSON.stringify(jobUrls, null, 2));

    if (jobUrls.length === 0) {
      console.log('Nenhuma vaga encontrada. Capturando conteúdo da página...');
      const pageContent = await page.content();
      console.log('Conteúdo da página:', pageContent);
      res.status(404).json({ totalVagas: 0, vagas: [], message: 'Nenhuma vaga encontrada', pageContent });
    } else {
      res.json({
        totalVagas: jobUrls.length,
        vagas: jobUrls,
      });
    }
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
    if (browser) await browser.close();
  }
};