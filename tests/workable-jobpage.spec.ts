import { test, expect, chromium } from '@playwright/test';
import fs from 'fs/promises';

const jobListings = [
  { company: 'quintoandar', url: 'https://apply.workable.com/quintoandar/j/5E4F3A7906/' },
  { company: 'pravaler', url: 'https://apply.workable.com/pravaler-1/j/42357AC575/' },
  { company: 'loggi', url: 'https://apply.workable.com/loggi/j/6291C81C5E/' },
  { company: 'axur', url: 'https://apply.workable.com/axur/j/DEDB8E1006/' },
  { company: 'nomadglobal', url: 'https://apply.workable.com/nomadglobal/j/70CC69D082/' },
];

jobListings.forEach(({ company, url }) => {
  test(`extrair conteúdo bruto da vaga ${company}`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Extrair o conteúdo HTML da página
    const content = await page.content();

    // Salvar o conteúdo bruto em um arquivo HTML
    await fs.writeFile(`vaga_${company}.html`, content);

    console.log(`Conteúdo bruto da vaga ${company} salvo em vaga_${company}.html`);
  });
});