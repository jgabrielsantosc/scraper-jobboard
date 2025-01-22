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
    await page.waitForSelector('h1.factorial__headingFontFamily', { timeout: 60000 });

    const jobInfo = await page.evaluate(() => {
      // Função auxiliar para extrair texto limpo
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Extrair título
      const title = getTextContent('h1.factorial__headingFontFamily');

      // Extrair informações de contrato, período e localização
      const infoItems = Array.from(document.querySelectorAll('ul li'));
      let contractType = '';
      let workPeriod = '';
      let location = '';

      infoItems.forEach(item => {
        const text = item.textContent?.trim() || '';
        if (text.includes('CLT')) {
          contractType = text.replace(/\\n/g, ' ').trim();
        } else if (text.includes('Período')) {
          workPeriod = text.replace(/\\n/g, ' ').trim();
        } else if (text.includes('Brasil')) {
          location = text.replace(/\\n/g, ' ').trim();
        }
      });

      // Extrair descrição e outras seções
      const sections: { [key: string]: string[] } = {
        description: [],
        requirements: [],
        differentials: [],
        benefits: []
      };

      let currentSection = 'description';

      // Função para processar texto e determinar a seção
      const processText = (text: string): string => {
        if (text.includes('Requisitos')) return 'requirements';
        if (text.includes('Será um diferencial')) return 'differentials';
        if (text.includes('Informações Adicionais')) return 'benefits';
        return currentSection;
      };

      // Processar todos os elementos de texto
      document.querySelectorAll('.styledText > *').forEach(element => {
        const text = element.textContent?.trim() || '';
        
        // Atualizar seção atual se necessário
        currentSection = processText(text);

        // Se for uma lista, processar seus itens
        if (element.tagName === 'UL') {
          const items = Array.from(element.querySelectorAll('li'))
            .map(li => li.textContent?.trim())
            .filter((item): item is string => Boolean(item));
          
          sections[currentSection].push(...items);
        } 
        // Se for parágrafo e estiver na seção de descrição, adicionar o texto
        else if (element.tagName === 'P' && currentSection === 'description') {
          const content = element.textContent?.trim();
          if (content) {
            sections.description.push(content);
          }
        }
      });

      return {
        title,
        contract_type: contractType,
        work_period: workPeriod,
        location,
        description: sections.description.join('\n'),
        requirements: sections.requirements,
        differentials: sections.differentials,
        benefits: sections.benefits
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