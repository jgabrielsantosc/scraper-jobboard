import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobGreenhouseHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const jobInfo = await page.evaluate(() => {
      const title = document.querySelector('h1.section-header.section-header--large.font-primary')?.textContent?.trim() || '';
      const location = document.querySelector('p.body.body--metadata')?.textContent?.trim() || '';
      const description = document.querySelector('div.job__description.body')?.textContent?.trim() || '';

      return { title, location, description };
    });

    await browser.close();

    if (!jobInfo.title && !jobInfo.location && !jobInfo.description) {
      res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
    } else {
      // Formatar a descrição para Markdown
      const formattedDescription = jobInfo.description.replace(/\n\n/g, '\n');
      res.json({ ...jobInfo, description: formattedDescription });
    }
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};