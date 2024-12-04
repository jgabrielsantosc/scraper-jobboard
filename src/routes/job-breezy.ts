import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobBreezyHandler: ExpressHandler = async (
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
    await page.waitForSelector('.description');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair texto de elementos com classe específica dentro de ul.meta
      const getMetaInfo = (iconClass: string): string => {
        const element = document.querySelector(`ul.meta li i.${iconClass}`);
        return element?.parentElement?.querySelector('span')?.textContent?.trim() || '';
      };

      // Extrair título
      const title = document.querySelector('h1')?.textContent?.trim() || '';

      // Extrair informações base
      const location = getMetaInfo('fa-map-marker');
      const workType = getMetaInfo('fa-building');
      
      // Extrair departamento (último item com fa-building)
      const departmentElement = Array.from(document.querySelectorAll('ul.meta li i.fa-building'))
        .pop()?.parentElement?.querySelector('span');
      const department = departmentElement?.textContent?.trim() || '';

      // Extrair descrição completa
      const description = document.querySelector('.description')?.innerHTML || '';

      // Extrair requisitos (experiências/background relevantes)
      const requirements = Array.from(document.querySelectorAll('.description ul li'))
        .map(item => item.textContent?.trim())
        .filter(Boolean);

      // Extrair benefícios (procurando após o texto "Benefícios:")
      const benefitsSection = Array.from(document.querySelectorAll('.description p, .description ul'))
        .find(element => element.textContent?.includes('Benefícios:'));
      
      const benefits = benefitsSection
        ? Array.from(benefitsSection.nextElementSibling?.querySelectorAll('li') || [])
            .map(item => item.textContent?.trim())
            .filter(Boolean)
        : [];

      return {
        title,
        location,
        work_type: workType,
        department,
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