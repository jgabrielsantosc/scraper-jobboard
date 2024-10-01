import { Request, Response, NextFunction } from 'express';
import { chromium, Page } from 'playwright';
import { ExpressHandler } from '../types';

export const scraperJobGupy: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    let todasAsVagas: any[] = [];
    let paginaAtual = 1;

    while (true) {
      const vagasDaPagina: any[] = await coletarInformacoesDaPagina(page);
      todasAsVagas = todasAsVagas.concat(vagasDaPagina);

      const botaoProxima = page.locator('[data-testid="pagination-next-button"]');
      const botaoProximaDesabilitado = await botaoProxima.getAttribute('disabled');

      if (botaoProximaDesabilitado === null) {
        await botaoProxima.click();
        await page.waitForLoadState('networkidle');
        paginaAtual++;
      } else {
        break;
      }
    }

    await browser.close();

    res.json({ totalVagas: todasAsVagas.length, vagas: todasAsVagas });
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  }
}

async function coletarInformacoesDaPagina(page: Page) {
  const vagas = await page.locator('[data-testid="job-list__listitem"]').all();
  const informacoes = [];

  for (const vaga of vagas) {
    const titulo = await vaga.locator('.sc-f5007364-4').textContent();
    const localizacao = await vaga.locator('.sc-f5007364-5').textContent();
    const tipo = await vaga.locator('.sc-f5007364-6').textContent();
    const link = await vaga.locator('[data-testid="job-list__listitem-href"]').getAttribute('href');

    informacoes.push({
      titulo: titulo?.trim(),
      localizacao: localizacao?.trim(),
      tipo: tipo?.trim(),
      url_job: link ? `${new URL(page.url()).origin}${link}` : undefined
    });
  }

  return informacoes;
}