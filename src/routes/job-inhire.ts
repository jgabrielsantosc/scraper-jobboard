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
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ],
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
                 'Chrome/117.0.0.0 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 },
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo',
    });

    const page = await context.newPage();

    console.log('Navegando para a URL:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Página carregada');

    // Aguarda um seletor que indica que o conteúdo foi carregado
    const contentSelector = '#root'; // Ajuste conforme necessário
    await page.waitForSelector(contentSelector, { timeout: 60000 });
    console.log('Conteúdo principal disponível');

    // Opcional: Aguarda alguns segundos para garantir que o conteúdo foi carregado
    await page.waitForTimeout(5000);

    // Avalia o conteúdo da página
    const content = await page.evaluate(() => {
      // Ajuste o seletor para capturar o conteúdo desejado
      const element = document.querySelector('#root');
      return element ? (element as HTMLElement).innerText : '';
    });

    // Processa o conteúdo (se necessário)
    const cleanContent = content.trim();

    // Retorna o conteúdo
    res.json({
      content: cleanContent,
      formattedContent: cleanContent.split('\n')
    });

    // Logs para depuração
    console.log('Conteúdo encontrado:', cleanContent.substring(0, 100) + '...');

  } catch (error: any) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: error.message, stack: error.stack });
    return;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};