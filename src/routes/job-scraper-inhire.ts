import { Request, Response, NextFunction } from 'express';
import { chromium, Browser, BrowserContext, Page, devices } from 'playwright';
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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ],
    });

    const iPhone = devices['iPhone 11'];
    context = await browser.newContext({
      ...iPhone,
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo',
      locale: 'pt-BR',
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'platform', { get: () => 'iPhone' });
    });

    page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 180000 }); // Aumente o timeout para 3 minutos
    console.log('Página carregada');

    await randomDelay(5000, 10000); // Aumente o delay após o carregamento da página

    console.log('Esperando o conteúdo carregar...');
    await page.waitForSelector('#root', { state: 'attached', timeout: 180000 });
    console.log('Conteúdo principal carregado');

    await randomDelay(5000, 10000);

    console.log('Verificando se há conteúdo dinâmico...');
    await page.waitForFunction(() => {
      const root = document.querySelector('#root');
      return root && root.children.length > 1;
    }, { timeout: 180000 });
    console.log('Conteúdo dinâmico detectado');

    await randomDelay(5000, 10000);

    console.log('Procurando links de vagas...');
    const jobUrls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/vagas/"]'));
      console.log('Links encontrados:', links.length);
      return links.map(link => {
        const href = link.getAttribute('href');
        return href ? new URL(href, window.location.href).href : null;
      }).filter(url => url !== null);
    });

    console.log(`Total de vagas encontradas: ${jobUrls.length}`);

    const finalUrl = page.url();
    if (finalUrl !== url) {
      console.log(`A página foi redirecionada para: ${finalUrl}`);
    }

    console.log('Capturando informações da página...');
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`Título da página: ${pageTitle}`);
    console.log(`URL atual: ${pageUrl}`);

    const pageContent = await page.content();
    console.log('Conteúdo da página:', pageContent.substring(0, 500) + '...');

    if (jobUrls.length === 0) {
      console.log('Nenhuma vaga encontrada. Capturando mais informações...');
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('Texto do corpo da página:', bodyText.substring(0, 1000) + '...');
    }

    console.log('Capturando screenshot após carregamento...');
    await page.screenshot({ path: 'loaded-screenshot.png', fullPage: true });

    console.log('Verificando desafios de segurança...');
    const securityChallenge = await page.$('iframe[src*="challenges"]') || await page.$('#captcha');
    if (securityChallenge) {
      console.log('Desafio de segurança detectado');
      // Implemente lógica para lidar com o desafio, se possível
    }

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