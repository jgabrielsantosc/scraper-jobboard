import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobQuickinHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const jobCards = await page.$$('tr[data-v-4491386a]');
    const jobs = [];

    for (const jobCard of jobCards) {
      const title = await jobCard.$eval('a.text-dark', el => el.textContent?.trim());
      const link = await jobCard.$eval('a.text-dark', el => (el as HTMLAnchorElement).href);
      const location = await jobCard.$eval('td span[data-v-4491386a]', el => el.textContent?.trim());
      const workModel = await jobCard.$eval('td span.badge-secondary', el => el.textContent?.trim());

      jobs.push({ title, url_job: link, location, work_model: workModel });
    }

    await browser.close();

    if (jobs.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: jobs.length, vagas: jobs });
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