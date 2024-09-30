import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { convert } from 'html-to-text';
import { ExpressHandler } from '../types';

export const jobWorkableHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const title = await page.locator('h1[data-ui="job-title"]').textContent();
    const workModel = await page.locator('span[data-ui="job-workplace"] strong').textContent();
    const typeJob = await page.locator('span[data-ui="job-type"]').textContent();
    const locationElements = await page.locator('div[data-ui="job-location-tooltip"] span').allTextContents();
    const location = locationElements.join(' ').trim();
    const descriptionHtml = await page.locator('section[data-ui="job-description"]').innerHTML();
    const description = convert(descriptionHtml, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    });

    const jobInfo = {
      title: title?.trim(),
      work_model: workModel?.trim(),
      type_job: typeJob?.trim(),
      location: location,
      description: description.trim(),
    };

    await browser.close();

    if (!jobInfo.title && !jobInfo.work_model && !jobInfo.type_job && !jobInfo.location && !jobInfo.description) {
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