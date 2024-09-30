import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobWorkableHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const vagas = await page.$$eval('ul[data-ui="list"] li[data-ui="job"]', (elements) => {
      return elements.map((el) => {
        const titleElement = el.querySelector('h3[data-ui="job-title"] span');
        const pubDateElement = el.querySelector('small[data-ui="job-posted"]');
        const workModelElement = el.querySelector('span[data-ui="job-workplace"] strong');
        const locationElement = el.querySelector('div[data-ui="job-location-tooltip"] span');
        const typeJobElement = el.querySelector('span[data-ui="job-type"]');
        const urlJobElement = el.querySelector('a');

        return {
          title: titleElement?.textContent?.trim() ?? '',
          pub_date: pubDateElement?.textContent?.trim() ?? '',
          work_model: workModelElement?.textContent?.trim() ?? '',
          location: locationElement?.textContent?.trim() ?? '',
          type_job: typeJobElement?.textContent?.trim() ?? '',
          url_job: urlJobElement ? `https://apply.workable.com${urlJobElement.getAttribute('href')}` : '',
        };
      });
    });

    await browser.close();

    if (vagas.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: vagas.length, vagas });
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