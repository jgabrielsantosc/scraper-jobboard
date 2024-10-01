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

    let allVagas: any[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      const vagasDaPagina = await extrairVagas(page);
      allVagas = allVagas.concat(vagasDaPagina);

      hasNextPage = await verificarProximaPagina(page);
      if (hasNextPage) {
        await clicarProximaPagina(page);
        await page.waitForTimeout(3000);
      }
    }

    await browser.close();

    if (allVagas.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: allVagas.length, vagas: allVagas });
    }
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

async function extrairVagas(page: Page) {
  return page.evaluate(() => {
    const rows = document.querySelectorAll('table.table tbody tr');
    return Array.from(rows).map(row => {
      const title = row.querySelector('strong')?.textContent?.trim();
      const url_job = row.querySelector('a.btn-apply')?.getAttribute('href');
      const pub_date = row.querySelector('td:nth-child(2)')?.textContent?.trim();
      const seniority = row.querySelector('td:nth-child(3)')?.textContent?.trim();
      const contract_model = row.querySelector('td:nth-child(4)')?.textContent?.trim();
      const location = row.querySelector('td:nth-child(5)')?.textContent?.trim();

      return { title, url_job, pub_date, seniority, contract_model, location };
    });
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