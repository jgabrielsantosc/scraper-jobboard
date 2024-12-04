import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobSelectyHandler: ExpressHandler = async (
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
    await page.waitForSelector('[data-automation-id="jobPostingHeader"]');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair texto de elementos dd dentro de divs com data-automation-id
      const getAutomationValue = (id: string): string => {
        const element = document.querySelector(`div[data-automation-id="${id}"] dd`);
        return element?.textContent?.trim() || '';
      };

      // Extrair título
      const title = getTextContent('[data-automation-id="jobPostingHeader"]');

      // Extrair informações básicas
      const remoteType = getAutomationValue('remoteType');
      const location = getAutomationValue('locations');
      const timeType = getAutomationValue('time');
      const datePosted = getAutomationValue('postedOn');
      const timeLeftToApply = getAutomationValue('timeLeftToApply');

      // Extrair ID da requisição
      const requisitionId = getTextContent('ul[data-automation-id="subtitle"] li');

      // Extrair descrição completa
      const description = document.querySelector('[data-automation-id="jobPostingDescription"]')?.innerHTML || '';

      return {
        title,
        remote_type: remoteType,
        location,
        time_type: timeType,
        date_posted: datePosted,
        time_left_to_apply: timeLeftToApply,
        requisition_id: requisitionId,
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