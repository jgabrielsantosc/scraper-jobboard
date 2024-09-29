import { Request, Response } from 'express';
import { chromium } from 'playwright';

export async function scraperJobGupy(req: Request, res: Response) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const vagas = await page.evaluate(() => {
      const vagasElements = document.querySelectorAll('[data-testid="job-list__listitem"]');
      return Array.from(vagasElements).map((vaga) => {
        const titulo = vaga.querySelector('.sc-f5007364-4')?.textContent?.trim();
        const localizacao = vaga.querySelector('.sc-f5007364-5')?.textContent?.trim();
        const tipo = vaga.querySelector('.sc-f5007364-6')?.textContent?.trim();
        const link = vaga.querySelector('[data-testid="job-list__listitem-href"]')?.getAttribute('href');
        return { titulo, localizacao, tipo, link: link ? `${url}${link}` : undefined };
      });
    });

    await browser.close();

    res.json({ totalVagas: vagas.length, vagas });
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
  }
}