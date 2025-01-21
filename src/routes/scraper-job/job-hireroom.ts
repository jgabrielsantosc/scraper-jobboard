import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../../types/types';

export const jobHireroomHandler: ExpressHandler = async (
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
    await page.waitForSelector('.hero__container');
    await page.waitForSelector('.main__description');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair lista de itens
      const getListItems = (selector: string): string[] => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
          .map(el => el.textContent?.trim())
          .filter(Boolean) as string[];
      };

      // Extrair título
      const title = getTextContent('h2.commonstxt');

      // Extrair localização e área
      const location = getTextContent('p.commonstxt[title]');
      const workArea = getTextContent('.hero__area-ubication p:nth-child(2)');

      // Extrair descrição
      const description = getTextContent('.main__description > p.commonstxt.descjobs');

      // Extrair requisitos
      const requirements = getListItems('.main__description ul.commonstxt.descjobs li');

      // Extrair benefícios (segunda lista ul encontrada)
      const benefits = getListItems('.main__description ul.commonstxt.descjobs:nth-of-type(2) li');

      return {
        title,
        location,
        work_area: workArea,
        description,
        requirements,
        benefits
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