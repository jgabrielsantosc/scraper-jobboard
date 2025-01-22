import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobSolidesHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const titleElement = document.querySelector('h1 > div > span') || document.querySelector('h1.text-subtitle1.font-semibold');
      const title = titleElement ? titleElement.textContent?.trim() : '';

      const locationElement = document.querySelector('[data-testid="locale-info"]') as HTMLElement;
      const location = locationElement ? locationElement.textContent?.trim() : '';

      const contractTypeElement = document.querySelector('[data-cy="badges_contract_type"] div') as HTMLElement;
      const contractType = contractTypeElement ? contractTypeElement.textContent?.trim() : '';

      const jobTypeElement = document.querySelector('[data-cy="badges_job_type"] div') as HTMLElement;
      const jobType = jobTypeElement ? jobTypeElement.textContent?.trim() : '';

      const seniorityElement = document.querySelector('[data-cy="badges_seniority"] div') as HTMLElement;
      const seniority = seniorityElement ? seniorityElement.textContent?.trim() : '';

      const description = document.querySelector('[data-cy="description"]')?.textContent?.trim() || '';

      const educationElements = Array.from(document.querySelectorAll('[data-cy="vacancy-educations"] li')).map(li => li.textContent?.trim());
      const educations = educationElements.filter(Boolean).join(', ');

      const addressElement = document.querySelector('[data-testid="how-to-get-location"]') as HTMLElement;
      const address = addressElement ? addressElement.textContent?.trim() : '';

      return { 
        title, 
        location, 
        contractType, 
        jobType, 
        seniority, 
        description, 
        educations, 
        address 
      };
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