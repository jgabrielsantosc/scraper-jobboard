import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobAblerHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const title = document.querySelector('h1')?.textContent?.trim() || '';
      const jobType = document.querySelector('.small.text-center')?.textContent?.trim() || '';
      const location = document.querySelector('tr:nth-child(2) td:nth-child(2)')?.textContent?.trim() || '';
      const description = document.querySelector('.card-body.card-description')?.textContent?.trim() || '';
      
      const infoRows = document.querySelectorAll('tr');
      let area = '';
      let requirements = '';
      let benefits = '';

      infoRows.forEach((row) => {
        const label = row.querySelector('th')?.textContent?.trim() || '';
        const value = row.querySelector('td')?.textContent?.trim() || '';

        if (label.includes('Área da vaga')) {
          area = value;
        } else if (label.includes('Nível de escolaridade')) {
          requirements = value;
        } else if (label.includes('Benefícios')) {
          benefits = value;
        }
      });

      return { title, jobType, location, area, description, requirements, benefits };
    });

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