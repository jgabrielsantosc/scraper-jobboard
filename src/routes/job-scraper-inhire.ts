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
  try {
    console.log('Iniciando o navegador...');
    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/85.0.4183.83 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 }, // Coordenadas de São Paulo, Brasil
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo', // Fuso horário de São Paulo
    });

    const page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { timeout: 120000, waitUntil: 'networkidle' });

    console.log('Esperando o seletor .css-jswd32.eicjt3c5...');
    await page.waitForSelector('.css-jswd32.eicjt3c5', { timeout: 120000 });

    console.log('Rolando a página...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    console.log('Extraindo informações das vagas...');
    const vagas = await page.$$eval('.css-jswd32.eicjt3c5 li', (elements, baseUrl) => {
      return elements.map((el) => {
        const titleElement = el.querySelector('[data-sentry-element="JobPositionName"]');
        const linkElement = el.querySelector('a[data-sentry-element="NavLink"]');
        return {
          title_job: titleElement?.textContent?.trim() ?? '',
          url_job: linkElement ? `${baseUrl}${linkElement.getAttribute('href')}` : '',
        };
      });
    }, url); // Passando a URL base como segundo argumento

    console.log(`Total de vagas encontradas: ${vagas.length}`);
    console.log(JSON.stringify(vagas, null, 2));

    if (vagas.length === 0) {
      res.status(404).json({ totalVagas: 0, vagas: [], message: 'Nenhuma vaga encontrada' });
    } else {
      res.json({
        totalVagas: vagas.length,
        vagas: vagas,
      });
    }
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};