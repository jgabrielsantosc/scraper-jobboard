import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobGreenhouseHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    console.log(`Navegando para a URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const bodyContent = await page.evaluate(() => {
      const body = document.body;
      return body.innerText;
    });

    console.log('Conteúdo do body coletado');

    if (!bodyContent) {
      throw new Error('Não foi possível extrair o conteúdo da página');
    }

    res.json({ content: bodyContent });
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};