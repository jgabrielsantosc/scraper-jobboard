import { test, expect, chromium } from '@playwright/test';

test('extrair informações da vaga Abler', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://talentflix.abler.com.br/vagas/estagio-em-marketing-577734');
  await page.waitForLoadState('domcontentloaded');

  const jobInfo = await page.evaluate(() => {
    // Extrai o título e remove o ID da vaga, se presente
    let title = document.querySelector('h1')?.textContent?.trim() || '';
    const idIndex = title.indexOf(' - ');
    if (idIndex !== -1) {
      title = title.substring(idIndex + 3);
    }

    const jobType = document.querySelector('.small.text-center')?.textContent?.trim() || '';
    const area = Array.from(document.querySelectorAll('tr')).find(row => row.textContent?.includes('Área da vaga:'))?.querySelector('td')?.textContent?.trim() || '';
    const location = Array.from(document.querySelectorAll('tr')).find(row => row.textContent?.includes('Onde você vai trabalhar:'))?.querySelector('td')?.textContent?.trim() || '';
    const description = document.querySelector('.card-body.card-description')?.textContent?.trim() || '';
    const requirements = Array.from(document.querySelectorAll('tr')).find(row => row.textContent?.includes('Nível de escolaridade:'))?.querySelector('td')?.textContent?.trim() || '';
    const benefits = Array.from(document.querySelectorAll('tr')).find(row => row.textContent?.includes('Benefícios:'))?.querySelector('td')?.textContent?.trim() || '';

    return { title, jobType, area, location, description, requirements, benefits };
  });

  console.log(JSON.stringify(jobInfo, null, 2));

  // Asserções removidas
  // ... 

  await browser.close();
});