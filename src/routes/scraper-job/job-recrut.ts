import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../../types/types';

export const jobRecrutHandler: ExpressHandler = async (
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
    await page.waitForSelector('b[cade-title-vacancy]');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair texto de spans dentro de divs específicos
      const getSpanText = (index: number): string => {
        const span = document.querySelector(`div.row.p-3 div.col-sm-6:nth-child(${index}) span.text-left`);
        return span?.textContent?.trim().replace(/^[-\s]+/, '') || '';
      };

      // Extrair título
      const title = getTextContent('b[cade-title-vacancy]');

      // Extrair informações adicionais
      const workModel = getSpanText(1);      // Primeiro div col-sm-6
      const contractType = getSpanText(2);   // Segundo div col-sm-6
      const location = getSpanText(3);       // Terceiro div col-sm-6
      const jobType = getSpanText(4);        // Quarto div col-sm-6

      // Extrair descrição completa
      const descriptionDiv = document.querySelector('div.row.p-3')?.nextElementSibling;
      const description = descriptionDiv?.innerHTML || '';

      return {
        title,
        work_model: workModel,
        contract_type: contractType,
        location,
        job_type: jobType,
        description
      };
    });

    res.json(jobInfo);

  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 