import { test, expect } from '@playwright/test';

test('extrair informações detalhadas de uma vaga específica da Inhire', async ({ page }) => {
  const baseUrl = 'https://ume.inhire.app';
  const jobUrl = '/vagas/b0d4c1e2-0d64-4db8-a723-fda1874bf1f4/coordenador-de-growth';
  
  await page.goto(`${baseUrl}${jobUrl}`);
  
  // Esperar pelo carregamento inicial da página
  await page.waitForLoadState('networkidle');
  
  try {
    const infoDetalhada = {
      title_job: await page.locator('h1').textContent(),
      description: await page.locator('.job-description').textContent(),
    };

    console.log(infoDetalhada);

    expect(infoDetalhada.title_job).toBeTruthy();
    expect(infoDetalhada.description).toBeTruthy();
  } catch (error) {
    console.error('Erro ao extrair informações:', error);
    throw error;
  }
});

async function getWorkModelAndLocation(page) {
  const container = await page.locator('.css-19vloxk').first();
  
  const workModelElement = await container.locator('.css-84mew7 .css-1ma1opn').first();
  const workModel = await workModelElement.textContent();
  
  const locationElement = await container.locator('.css-1ma1opn').last();
  const location = await locationElement.textContent();

  return { 
    work_model: workModel ? workModel.trim() : '', 
    location: location ? location.trim() : '' 
  };
}

async function getDescription(page) {
  const descriptionElements = await page.locator('.css-i3pbo.e5r6srz1 [dir="ltr"]').all();
  const descriptionTexts = await Promise.all(descriptionElements.map(el => el.textContent()));
  return descriptionTexts.filter(text => text).join('\n\n');
}

test.setTimeout(120000); // 2 minutos