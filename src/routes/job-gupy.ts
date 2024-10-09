import { Request, Response, NextFunction } from 'express';
import { chromium, Page } from 'playwright';
import { ExpressHandler } from '../types';

/**
 * Manipula a requisição para coletar informações de uma vaga no Gupy
 * @param req - Objeto de requisição Express
 * @param res - Objeto de resposta Express
 */
export const jobGupyHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const infoDetalhada = await page.evaluate(() => {
      function getTextContent(selector: string, index: number = 0): string {
        const elements = document.querySelectorAll(selector);
        if (elements.length > index) {
          const text = elements[index].textContent;
          return text ? text.trim() : '';
        }
        return '';
      }

      return {
        title: getTextContent('h1#h1'), // Usando a mesma função para o título
        type_job: getTextContent('.sc-dfd42894-0.bzQMFp', 0),
        work_model: getTextContent('.sc-dfd42894-0.bzQMFp', 1),
        pcd: getTextContent('.sc-dfd42894-0.bzQMFp', 2),
        pub_job: getTextContent('.sc-ccd5d36-11.dmmNfl', 0),
        deadline: getTextContent('.sc-ccd5d36-11.dmmNfl', 1),
        description_job: getTextContent('.sc-add46fb1-3.cOkxvQ', 0),
        requirements: getTextContent('.sc-add46fb1-3.cOkxvQ', 1),
        infos_extras: getTextContent('.sc-add46fb1-3.cOkxvQ', 2) || ' ',
        etapas: getTextContent('.sc-c87ac0d4-0.gDozGp', 0) || ' ',
        about: getTextContent('.sc-add46fb1-3.cOkxvQ', 3) || ' ',
      };
    });

    await browser.close();

    res.json(infoDetalhada);
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  }
}