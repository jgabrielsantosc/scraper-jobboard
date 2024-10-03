import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobLever = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const jobUrls = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.posting');
      return Array.from(jobCards)
        .map(card => card.querySelector('.posting-btn-submit')?.getAttribute('href') || '')
        .filter(url => url !== '');
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

export const scraperJobLeverHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const jobUrls = await scraperJobLever(url);
    res.json({ urls: jobUrls });
  } catch (error) {
    console.error('Erro ao coletar URLs das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar URLs das vagas' });
  }
};