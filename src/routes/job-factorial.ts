import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobFactorialHandler: ExpressHandler = async (
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
    await page.waitForSelector('.job-detail');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Extrair título
      const title = getTextContent('.job-detail__title');

      // Extrair localização
      const location = getTextContent('.job-detail__location');

      // Extrair tipo de contrato
      const contractType = getTextContent('.job-detail__contract-type');

      // Extrair departamento
      const department = getTextContent('.job-detail__department');

      // Extrair descrição
      const description = document.querySelector('.job-detail__description')?.innerHTML || '';

      // Extrair requisitos
      const requirements = Array.from(document.querySelectorAll('.job-detail__requirements li'))
        .map(item => item.textContent?.trim())
        .filter(Boolean);

      // Extrair benefícios
      const benefits = Array.from(document.querySelectorAll('.job-detail__benefits li'))
        .map(item => item.textContent?.trim())
        .filter(Boolean);

      // Extrair salário se disponível
      const salary = getTextContent('.job-detail__salary');

      return {
        title,
        location,
        contract_type: contractType,
        department,
        description,
        requirements,
        benefits,
        salary: salary || undefined
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