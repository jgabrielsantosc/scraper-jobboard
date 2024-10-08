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
    browser = await chromium.launch({ headless: true }); // Mudança para modo headless

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
                 'Chrome/85.0.4183.83 Safari/537.36',
      geolocation: { longitude: -46.6333, latitude: -23.5505 }, // Coordenadas de São Paulo, Brasil
      permissions: ['geolocation'],
      timezoneId: 'America/Sao_Paulo', // Fuso horário de São Paulo
    });

    const page = await context.newPage();

    console.log('Navegando para a URL:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log('Página carregada');

    await page.waitForLoadState('networkidle');
    console.log('Estado de rede inativo');

    // Espere por um elemento que você sabe que sempre estará presente na página
    await page.waitForSelector('body', { state: 'visible', timeout: 60000 });

    // Remova o scroll manual e use a função de avaliação diretamente
    const content = await page.evaluate(() => {
      const element = document.querySelector('#root > div > div.css-16qnfbn > div.css-tjublp.e1xgy92m0');
      return element ? element.innerHTML : '';
    });

    // Função para remover tags HTML e adicionar espaçamento
    const stripHtmlWithSpacing = (html: string) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      
      // Substituir algumas tags por quebras de linha
      div.innerHTML = div.innerHTML
        .replace(/<\/h1>|<\/h2>|<\/h3>|<\/p>|<br>/gi, '$&\n\n')
        .replace(/<li>/gi, '• ')
        .replace(/<\/li>/gi, '\n');
      
      let text = div.textContent || div.innerText || '';
      
      // Remover espaços em excesso e adicionar quebras de linha
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .replace(/([.!?])\s+/g, '$1\n\n')
        .trim();
      
      // Adicionar quebras de linha extras para seções
      text = text.replace(/([A-Z][a-z]+:)/g, '\n\n$1\n');
      
      return text;
    };

    // Limpar o HTML e retornar apenas o texto com espaçamento
    const cleanContent = await page.evaluate(stripHtmlWithSpacing, content);

    // Retornar o conteúdo tratado
    res.json({ 
      content: cleanContent,
      formattedContent: cleanContent.split('\n')
    });

    // Adicionar logs para depuração
    const pageContent = await page.content();
    console.log('Conteúdo da página:', pageContent);

    // Adicionar logs para depuração
    console.log('URL atual:', page.url());
    console.log('Título da página:', await page.title());
    console.log('Conteúdo encontrado:', content.substring(0, 100) + '...');

  } catch (error: unknown) {
    console.error('Erro ao coletar informações da vaga:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: error.message, stack: error.stack });
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
