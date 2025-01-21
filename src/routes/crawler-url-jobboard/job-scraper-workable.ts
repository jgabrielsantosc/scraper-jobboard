import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../../types';

export const scraperJobWorkableHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // Espera adicional para garantir que o conteúdo dinâmico seja carregado
    await page.waitForTimeout(5000);

    // Seletor abrangente para todos os job boards
    const vagaSelector = '[data-ui="job"] a, [data-ui="job-opening"] a';

    // Aguardar o carregamento inicial das vagas
    await page.waitForSelector(vagaSelector, { state: 'attached' });

    // Define um tempo limite para carregar as vagas (usado apenas para job boards com rolagem infinita)
    const timeout = 30000;
    const startTime = Date.now();

    let lastCount = 0;

    // Lógica de rolagem e clique no "Mostrar mais"
    while (Date.now() - startTime < timeout) {
      const loadMoreButton = await page.locator('[data-ui="load-more-button"]');
      if (await loadMoreButton.isVisible() && !await loadMoreButton.isDisabled()) {
        await loadMoreButton.click();
        // Aguardar novas vagas
        try {
          await page.waitForSelector(vagaSelector, { state: 'attached' });
        } catch (error) {
          console.error('Erro ao aguardar o seletor:', error);
          break;
        }
      } else {
        break; 
      }

      // Role a página
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const currentCount = await page.locator(vagaSelector).count();
      if (currentCount === lastCount) {
        break; 
      }
      lastCount = currentCount;
    }

    // Extrair URLs das vagas
    const vagaUrls = await page.$$eval(vagaSelector, (elements, baseUrl) => {
      return elements.map((el) => {
        const urlPath = el.getAttribute('href') || '';
        return urlPath ? new URL(urlPath, baseUrl).href : '';
      });
    }, url);

    // Remover URLs duplicadas
    const uniqueUrls = [...new Set(vagaUrls)];

    await browser.close();

    if (uniqueUrls.length === 0) {
      res.status(404).json([]);
    } else {
      res.json(uniqueUrls);
    }
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json([]);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
