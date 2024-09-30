import { test, expect } from '@playwright/test';

test('should extract job information', async ({ page }) => {
  await page.goto('https://ume.inhire.app/vagas/b0d4c1e2-0d64-4db8-a723-fda1874bf1f4/coordenador-de-growth');

  const title = await page.locator('h1[data-component-name="Jumbo"]').textContent();
  const workModel = await page.locator('span[data-component-name="Text"]').first().textContent();
  const location = await page.locator('span[data-component-name="Text"]').nth(1).textContent();
  const description = await page.locator('.css-i3pbo.e5r6srz1').textContent();

  console.log('Título:', title);
  console.log('Modelo de Trabalho:', workModel);
  console.log('Localização:', location);
  console.log('Descrição:', description);

  // Verificações básicas sem expectativas específicas de conteúdo
  expect(title).toBeTruthy();
  expect(workModel).toBeTruthy();
  expect(location).toBeTruthy();
  expect(description).toBeTruthy();
});