import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../../types/types';

export const jobEnliztHandler: ExpressHandler = async (
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
    await page.waitForSelector('.frame-content');

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Função para extrair texto após um título específico
      const getContentAfterTitle = (title: string): string => {
        const elements = Array.from(document.querySelectorAll('h3'));
        const titleElement = elements.find(el => el.textContent?.trim() === title);
        return titleElement?.nextElementSibling?.textContent?.trim() || '';
      };

      // Função para extrair lista de itens de uma seção markdown
      const getMarkdownListItems = (startText: string): string[] => {
        const paragraphs = Array.from(document.querySelectorAll('.markdown-body p, .markdown-body ul'));
        let foundSection = false;
        let items: string[] = [];

        for (const element of paragraphs) {
          if (element.textContent?.includes(startText)) {
            foundSection = true;
            continue;
          }
          
          if (foundSection && element.tagName.toLowerCase() === 'ul') {
            items = Array.from(element.querySelectorAll('li'))
              .map(li => li.textContent?.trim())
              .filter(Boolean) as string[];
            break;
          }
        }

        return items;
      };

      // Extrair título
      const title = document.querySelector('h1')?.textContent?.trim() || '';

      // Extrair código da vaga e localização
      const textContainers = document.querySelectorAll('.text-container p');
      const jobCode = Array.from(textContainers)
        .find(p => p.textContent?.includes('Código da Vaga'))
        ?.textContent?.replace('Código da Vaga:', '')
        .trim() || '';

      const location = Array.from(textContainers)
        .find(p => p.textContent?.includes('Cidade:'))
        ?.textContent?.replace('Cidade:', '')
        .trim() || '';

      // Extrair descrição
      const description = document.querySelector('.markdown-body')?.innerHTML || '';

      // Extrair tipo de contratação e remuneração
      const contractType = getContentAfterTitle('Tipo de Contratação');
      const salary = getContentAfterTitle('Remuneração');

      // Extrair requisitos e benefícios das seções markdown
      const requirements = getMarkdownListItems('Requisitos:');
      const benefits = getMarkdownListItems('Benefícios');

      return {
        title,
        job_code: jobCode,
        location,
        description,
        contract_type: contractType,
        salary: salary || undefined,
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