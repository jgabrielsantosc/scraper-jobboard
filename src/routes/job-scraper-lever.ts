import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

interface LeverJob {
  area: string;
  title: string;
  url_job: string;
  work_model: string;
  type_job: string;
  location: string;
}

export const scraperJobLeverHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const jobListings = await page.evaluate(() => {
      const jobGroups = document.querySelectorAll('.postings-group');
      const jobs: LeverJob[] = [];

      jobGroups.forEach((group) => {
        const area = group.querySelector('.large-category-header')?.textContent?.trim() || '';
        const jobCards = group.querySelectorAll('.posting');

        jobCards.forEach((card) => {
          const title = card.querySelector('[data-qa="posting-name"]')?.textContent?.trim() || '';
          const url_job = card.querySelector('.posting-btn-submit')?.getAttribute('href') || '';
          const work_model = card.querySelector('.workplaceTypes')?.textContent?.trim().replace('—', '').trim() || '';
          const type_job = card.querySelector('.commitment')?.textContent?.trim() || '';
          const location = card.querySelector('.location')?.textContent?.trim() || '';

          jobs.push({
            area,
            title,
            url_job,
            work_model,
            type_job,
            location
          });
        });
      });

      return jobs;
    });

    await browser.close();

    if (jobListings.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: jobListings.length, vagas: jobListings });
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