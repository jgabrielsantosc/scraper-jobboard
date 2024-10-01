import { test, expect } from '@playwright/test';

test('extrair vagas do jobboard da Abler', async ({ page }) => {
  await page.goto('https://work4all.abler.com.br/');

  // Esperar pelo carregamento da tabela de vagas
  await page.waitForSelector('table.table');

  // Extrair informações de todas as vagas
  const vagas = await page.evaluate(() => {
    const rows = document.querySelectorAll('table.table tbody tr');
    return Array.from(rows).map(row => {
      const title = row.querySelector('strong')?.textContent?.trim();
      const url = row.querySelector('a.btn-apply')?.getAttribute('href');
      const pub_date = row.querySelector('td:nth-child(2)')?.textContent?.trim();
      const seniority = row.querySelector('td:nth-child(3)')?.textContent?.trim();
      const contract_model = row.querySelector('td:nth-child(4)')?.textContent?.trim();
      const location = row.querySelector('td:nth-child(5)')?.textContent?.trim();

      return { title, url, pub_date, seniority, contract_model, location };
    });
  });

  // Verificar se foram extraídas vagas
  expect(vagas.length).toBeGreaterThan(0);

  // Verificar se cada vaga tem as informações necessárias
  for (const vaga of vagas) {
    expect(vaga.title).toBeDefined();
    expect(vaga.url).toBeDefined();
    expect(vaga.pub_date).toBeDefined();
    expect(vaga.seniority).toBeDefined();
    expect(vaga.contract_model).toBeDefined();
    expect(vaga.location).toBeDefined();
  }

  // Imprimir as vagas extraídas (opcional, para verificação)
  console.log(JSON.stringify(vagas, null, 2));
});