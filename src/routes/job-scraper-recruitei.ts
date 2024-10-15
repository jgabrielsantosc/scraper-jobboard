import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobRecruitei = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const jobUrls = await page.evaluate(() => {
      const baseUrl = 'https://jobs.recrutei.com.br';
      const jobCards = document.querySelectorAll('.styles__GridVacancies-sc-uz5dep-1 a');
      return Array.from(jobCards)
        .map(card => {
          const href = card.getAttribute('href');
          return href ? `${baseUrl}${href}` : null;
        })
        .filter(Boolean) as string[];
    });

    return jobUrls;
  } catch (error) {
    console.error('Erro ao coletar URLs das vagas:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const scraperJobRecruteiHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const jobUrls = await scraperJobRecruitei(url);
    res.json({ urls: jobUrls });
  } catch (error) {
    console.error('Erro ao coletar URLs das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar URLs das vagas' });
  }
};
