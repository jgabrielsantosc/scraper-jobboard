import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';
import { JSDOM } from 'jsdom';

const cleanHtml = (html: string): string => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove todos os atributos, exceto 'href' para links
  const allElements = document.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    const attributes = allElements[i].attributes;
    for (let j = attributes.length - 1; j >= 0; j--) {
      const attrName = attributes[j].name;
      if (attrName !== 'href') {
        allElements[i].removeAttribute(attrName);
      }
    }
  }

  // Remove espaços em branco excessivos e quebras de linha
  const content = document.body.innerHTML
    .replace(/(&nbsp;|\s)+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  // Remove <br> tags soltas
  const cleanedContent = content.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p>');

  // Envolve o conteúdo em um único <div>
  return `<div>${cleanedContent}</div>`;
};

export const jobRecruteiHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    await page.goto(url, { waitUntil: 'networkidle' });

    // Adiciona um delay para garantir que a página carregue completamente
    await page.waitForTimeout(5000);

    const jobInfo = await page.evaluate(() => {
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      const getListItems = (title: string): string[] => {
        const titleElement = Array.from(document.querySelectorAll('h2, h3, h4')).find(
          el => el.textContent?.trim().toLowerCase().includes(title.toLowerCase())
        );
        if (titleElement) {
          let nextElement = titleElement.nextElementSibling;
          const items: string[] = [];
          while (nextElement && nextElement.tagName !== 'H2' && nextElement.tagName !== 'H3' && nextElement.tagName !== 'H4') {
            const spans = nextElement.querySelectorAll('span');
            spans.forEach(span => {
              const text = span.textContent?.trim();
              if (text) items.push(text);
            });
            nextElement = nextElement.nextElementSibling;
          }
          return items;
        }
        return [];
      };

      const findElementByText = (text: string): Element | null => {
        return Array.from(document.querySelectorAll('h2, h3, h4')).find(
          el => el.textContent?.trim().toLowerCase().includes(text.toLowerCase())
        ) || null;
      };

      const getInfoAfterTitle = (title: string): string => {
        const titleElement = findElementByText(title);
        if (titleElement) {
          const nextElement = titleElement.nextElementSibling;
          return nextElement?.textContent?.trim() || '';
        }
        return '';
      };

      const mainCard = document.querySelector('.styles__Card-sc-1lzskjl-1');
      const leftContainer = mainCard?.querySelector('.container-left');
      const rightContainer = mainCard?.querySelector('.container-right');

      return {
        titulo: getTextContent('.styles__Title-sc-1lzskjl-2'),
        descricao: leftContainer?.querySelector('.styles__DescriptionsText-sc-1lzskjl-6')?.innerHTML || '',
        cargaHoraria: getInfoAfterTitle('Carga horária'),
        regimeContratacao: getInfoAfterTitle('Regime de Contratação'),
        conhecimentosHabilidades: getListItems('Conhecimentos e Habilidades'),
        beneficios: getListItems('Benefícios'),
        salario: getInfoAfterTitle('Salário'),
        localTrabalho: getInfoAfterTitle('Local de Trabalho')
      };
    });

    // Limpa o HTML da descrição
    jobInfo.descricao = cleanHtml(jobInfo.descricao);

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
