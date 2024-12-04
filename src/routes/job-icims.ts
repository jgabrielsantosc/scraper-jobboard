import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobIcimsHandler: ExpressHandler = async (
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
    await page.waitForSelector('.iCIMS_Header');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair texto de elementos específicos
      const getFieldContent = (fieldLabel: string): string => {
        const element = document.querySelector(`dt.iCIMS_JobHeaderField:has-text("${fieldLabel}") + dd span`);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair lista de itens de uma seção
      const getSectionItems = (sectionTitle: string): string[] => {
        const section = Array.from(document.querySelectorAll('h2.iCIMS_InfoMsg_Job'))
          .find(el => el.textContent?.includes(sectionTitle));
        
        if (!section) return [];

        const itemsList = section.nextElementSibling?.querySelectorAll('ul li');
        if (!itemsList) return [];

        return Array.from(itemsList)
          .map(item => item.textContent?.trim())
          .filter(Boolean) as string[];
      };

      // Extrair título
      const title = getTextContent('h1.iCIMS_Header');

      // Extrair localização
      const location = getTextContent('.col-xs-6.header.left span:not(.sr-only)');

      // Extrair área e tipo de posição
      const area = getFieldContent('Área');
      const jobType = getFieldContent('Tipo da posição');

      // Extrair descrição completa
      const about = getTextContent('.iCIMS_InfoMsg_Job .iCIMS_Expandable_Text');

      // Extrair listas
      const responsibilities = getSectionItems('Responsabilidades');
      const qualifications = getSectionItems('Qualificações');
      const benefits = getSectionItems('Benefícios');

      // Extrair informações adicionais
      const additionalInfo = getTextContent('h2:has-text("Informações Adicionais") + div');

      // Extrair link de aplicação
      const applyLink = document.querySelector('.iCIMS_JobOptions a[title="Candidatar-se"]')?.getAttribute('href') || '';

      return {
        title,
        location,
        area,
        job_type: jobType,
        about,
        responsibilities,
        qualifications,
        benefits,
        additional_info: additionalInfo,
        apply_link: applyLink
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