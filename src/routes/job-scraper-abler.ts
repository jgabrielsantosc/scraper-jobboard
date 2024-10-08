import { Request, Response, NextFunction } from 'express';
import { chromium, Page } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobAblerHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    await page.waitForSelector('table.table');

    let allUrls: string[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      const urlsDaPagina = await extrairUrls(page);
      allUrls = allUrls.concat(urlsDaPagina);

      hasNextPage = await verificarProximaPagina(page);
      if (hasNextPage) {
        await clicarProximaPagina(page);
        await page.waitForTimeout(3000);
      }
    }

    await browser.close();

    if (allUrls.length === 0) {
      res.status(404).json([]);
    } else {
      res.json(allUrls);
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

async function extrairUrls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const rows = document.querySelectorAll('table.table tbody tr');
    return Array.from(rows).map(row => {
      const url_job = row.querySelector('a.btn-apply')?.getAttribute('href');
      return url_job;
    }).filter(Boolean) as string[];
  });
}

async function verificarProximaPagina(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const nextButton = document.querySelector('li.page-item button.page-link[aria-label="Go to next page"]');
    return nextButton !== null && !nextButton.hasAttribute('disabled');
  });
}

async function clicarProximaPagina(page: Page): Promise<void> {
  await page.click('li.page-item button.page-link[aria-label="Go to next page"]');
}