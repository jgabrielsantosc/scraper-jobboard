import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobGreenhouse: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const jobUrls = await page.evaluate((baseUrl) => {
      const links = Array.from(document.querySelectorAll('a[href*="/jobs/"]'));
      return links
        .map(link => {
          const href = link.getAttribute('href');
          if (href) {
            // Verifica se a URL já está completa
            if (href.startsWith('http')) {
              return href;
            } else {
              // Constrói a URL completa
              const url = new URL(href, baseUrl);
              return url.href;
            }
          }
          return null;
        })
        .filter(url => url !== null);
    }, url);

    console.log('URLs das vagas coletadas:', jobUrls);

    if (jobUrls.length === 0) {
      throw new Error('Não foi possível encontrar URLs de vagas na página');
    }

    // Garante que todas as URLs sejam completas
    const completeJobUrls = jobUrls.map(jobUrl => {
      if (jobUrl.startsWith('http')) {
        return jobUrl;
      } else {
        return new URL(jobUrl, url).href;
      }
    });

    res.json(completeJobUrls);
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
