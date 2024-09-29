import { Request, Response } from 'express';
import { test } from '@playwright/test';

export async function jobGupyHandler(req: Request, res: Response) {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const result = await test.step('Coletar informações da vaga', async () => {
    const { page } = await test.createBrowserContext();
    
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const infoDetalhada = {
      type_job: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 0),
      work_model: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 1),
      pcd: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 2),
      pub_job: await getTextContent(page, '.sc-ccd5d36-11.dmmNfl', 0),
      deadline: await getTextContent(page, '.sc-ccd5d36-11.dmmNfl', 1),
      description_job: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 0),
      requirements: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 1),
      infos_extras: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 2) || ' ',
      etapas: await getTextContent(page, '.sc-c87ac0d4-0.gDozGp', 0) || ' ',
      about: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 3) || ' ',
    };

    await page.close();

    return infoDetalhada;
  });

  res.json(result);
}

async function getTextContent(page, selector: string, index: number): Promise<string> {
  const elements = await page.locator(selector).all();
  if (elements.length > index) {
    const text = await elements[index].textContent();
    return text ? text.trim() : ' ';
  }
  return ' ';
}