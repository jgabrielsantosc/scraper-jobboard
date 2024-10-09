import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { convert } from 'html-to-text';
import { ExpressHandler } from '../types';

export const jobWorkableHandler: ExpressHandler = async (
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
    await page.waitForLoadState('networkidle');

    // Capturar todo o conteúdo do body
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });

    // Converter o HTML para texto com espaçamento
    const textContent = convert(bodyContent, {
      wordwrap: 130,
      preserveNewlines: true,
      selectors: [
        { selector: 'h1', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
        { selector: 'h2', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
        { selector: 'h3', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
        { selector: 'p', options: { prefix: '\n', suffix: '\n' } },
        { selector: 'br', options: { format: 'inline', prefix: '\n' } },
        { selector: 'ul', options: { itemPrefix: '\n • ' } },
        { selector: 'ol', options: { itemPrefix: '\n  ' } },
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    });

    // Limpar espaços em branco excessivos
    const cleanedContent = textContent
      .replace(/\n\s+\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    await browser.close();

    res.json({
      content: cleanedContent,
      formattedContent: cleanedContent.split('\n')
    });
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};