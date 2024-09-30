import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { convert } from 'html-to-text';
import { ExpressHandler } from '../types';

export const jobWorkableHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    // Usando operador de coalescência nula (??)
    const title = (await page.locator('h1[data-ui="job-title"], h3[data-ui="job-title"]').textContent()) ?? '';
    const workModel = (await page.locator('span[data-ui="job-workplace"] strong').textContent()) ?? '';
    const typeJob = (await page.locator('span[data-ui="job-type"]').textContent()) ?? '';
    const location = (await page.locator('div[data-ui="job-location-tooltip"] span, div[data-ui="job-location"] [data-ellipsis-element="true"], div.styles--1Sarc.styles--Xn8hR [data-ellipsis-element="true"]').textContent()) ?? '';
    const descriptionHtml = (await page.locator('section[data-ui="job-description"]').innerHTML()) ?? '';

    const description = convert(descriptionHtml, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    });

    const jobInfo = {
      title: title.trim(),
      workModel: workModel.trim(),
      typeJob: typeJob.trim(),
      location: location.trim(),
      description: description.trim(),
    };

    await browser.close();

    res.json(jobInfo);
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};