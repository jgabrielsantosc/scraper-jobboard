import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../../types/types';

export const jobPandapeHandler: ExpressHandler = async (
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
    await page.waitForSelector('#detail');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair informação baseada no ícone
      const getInfoByIcon = (iconClass: string): string => {
        const element = document.querySelector(`i.icon.${iconClass}`)?.parentElement;
        return element?.querySelector('span')?.textContent?.trim() || '';
      };

      // Função para extrair lista de benefícios
      const getBenefits = (): string[] => {
        const benefits = document.querySelectorAll('#Benefits .custom-tag');
        return Array.from(benefits)
          .map(benefit => benefit.textContent?.trim())
          .filter(Boolean) as string[];
      };

      // Extrair título
      const title = getTextContent('h1.fw-600.color-title');

      // Extrair informações gerais
      const generalInfo = {
        location: getInfoByIcon('icon-location-pin-1'),
        work_model: getInfoByIcon('icon-buildings'),
        positions: getInfoByIcon('icon-users-1'),
        contract_type: getInfoByIcon('icon-sheet'),
        job_level: getInfoByIcon('icon-suitcase'),
        schedule: getInfoByIcon('icon-clock')
      };

      // Extrair descrição
      const description = getTextContent('#description');

      // Extrair requisitos
      const requirements = {
        studies: getTextContent('#Studies span'),
        languages: Array.from(document.querySelectorAll('#Languages span'))
          .map(el => el.textContent?.trim())
          .filter(Boolean),
        experience: getTextContent('#Valued span')
      };

      // Extrair benefícios
      const benefits = getBenefits();

      // Extrair informações sobre a empresa
      const aboutCompany = getTextContent('div[id^="about-"]');

      return {
        title,
        general_info: generalInfo,
        description,
        requirements,
        benefits,
        about_company: aboutCompany
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