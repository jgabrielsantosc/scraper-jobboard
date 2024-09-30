import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { ExpressHandler } from '../types';

interface GreenHouseJob {
  area: string;
  title: string;
  location: string;
  link: string;
}

export const scraperJobGreenhouse: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { timeout: 60000, waitUntil: 'networkidle' });

    const vagas = await page.evaluate(() => {
      const jobPosts = document.querySelectorAll('.job-posts');
      const resultado: GreenHouseJob[] = [];

      jobPosts.forEach((jobPost) => {
        const area = jobPost.querySelector('.section-header')?.textContent?.trim() || '';
        const vagasArea = jobPost.querySelectorAll('.job-post');

        vagasArea.forEach((vaga) => {
          const title = vaga.querySelector('.body--medium')?.textContent?.trim() || '';
          const location = vaga.querySelector('.body--metadata')?.textContent?.trim() || '';
          const link = vaga.querySelector('a')?.getAttribute('href') || '';

          resultado.push({ area, title, location, link });
        });
      });

      return resultado;
    });

    await browser.close();

    if (vagas.length === 0) {
      res.status(404).json({ error: 'Nenhuma vaga encontrada' });
    } else {
      res.json({ totalVagas: vagas.length, vagas });
    }
  } catch (error) {
    console.error('Erro ao coletar informações das vagas:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Erro ao coletar informações das vagas: ${error.message}` });
    } else {
      res.status(500).json({ error: 'Erro desconhecido ao coletar informações das vagas' });
    }
  }
};