import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

export const jobInhireHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
                 'Chrome/85.0.4183.83 Safari/537.36',
    });

    const page = await context.newPage();

    // Navegar para a URL fornecida
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Aguarde os elementos necessários carregarem
    await page.waitForSelector('h1[data-component-name="Jumbo"]', { timeout: 60000 });
    await page.waitForSelector('span[data-component-name="Text"]', { timeout: 60000 });
    await page.waitForSelector('.css-i3pbo.e5r6srz1', { timeout: 60000 });

    // Extrair as informações da vaga
    const title = await page.locator('h1[data-component-name="Jumbo"]').textContent();
    const workModel = await page.locator('span[data-component-name="Text"]').first().textContent();
    const location = await page.locator('span[data-component-name="Text"]').nth(1).textContent();
    const descricao = await page.locator('.css-i3pbo.e5r6srz1').first().textContent();

    console.log('Título:', title);
    console.log('Modelo de Trabalho:', workModel);
    console.log('Localização:', location);
    console.log('Descrição:', descricao);

    // Verificar se as informações foram coletadas
    if (!title && !workModel && !location && !descricao) {
      res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
    } else {
      const jobInfo = {
        title: title ? title.trim() : '',
        workModel: workModel ? workModel.trim() : '',
        location: location ? location.trim() : '',
        description: descricao ? descricao.trim() : '',
      };
      res.json(jobInfo);
    }
  } catch (error: unknown) {
    console.error('Erro ao coletar informações da vaga:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: error.message });
    } else {
      res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: 'Erro desconhecido' });
    }
    return;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};