import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

// ... (mantenha o código existente)

export const jobLeverHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const jobInfo = await page.evaluate(() => {
      const title = document.querySelector('h2')?.textContent?.trim() || '';
      const location_workmodel = document.querySelector('.sort-by-time.posting-category.medium-category-label.width-full.capitalize-labels.location')?.textContent?.trim() || '';
      const area = document.querySelector('.sort-by-team.posting-category.medium-category-label.capitalize-labels.department')?.textContent?.trim().replace('/', '') || '';
      const type_job = document.querySelector('.sort-by-commitment.posting-category.medium-category-label.capitalize-labels.commitment')?.textContent?.trim().replace('/', '') || '';
      const work_model = document.querySelector('.sort-by-time.posting-category.medium-category-label.capitalize-labels.workplaceTypes')?.textContent?.trim() || '';
      const description = document.querySelector('.section.page-centered[data-qa="job-description"]')?.textContent?.trim() || '';

      return { title, location_workmodel, area, type_job, work_model, description };
    });

    await browser.close();

    if (!jobInfo.title && !jobInfo.description) {
      res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
    } else {
      res.json(jobInfo);
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