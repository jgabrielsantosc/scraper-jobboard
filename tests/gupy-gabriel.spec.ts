import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe.configure({ retries: 2 });

async function coletarInformacoesDaPagina(page) {
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
      link: link ? `https://gabriel.gupy.io${link}` : undefined
    });
  }

  return informacoes;
}

test('capturar e exportar informações de todas as vagas', async ({ page }) => {
  await page.goto('https://gabriel.gupy.io/');
  await page.waitForLoadState('networkidle');

  let todasAsVagas = [];
  let paginaAtual = 1;

  while (true) {
    console.log(`Coletando informações da página ${paginaAtual}`);
    
    const vagasDaPagina = await coletarInformacoesDaPagina(page);
    todasAsVagas = todasAsVagas.concat(vagasDaPagina);

    const botaoProxima = page.locator('[data-testid="pagination-next-button"]');
    const botaoProximaDesabilitado = await botaoProxima.getAttribute('disabled');

    if (botaoProximaDesabilitado === null) {
      await botaoProxima.click();
      await page.waitForLoadState('networkidle');
      paginaAtual++;
    } else {
      console.log('Última página alcançada ou apenas uma página de resultados.');
      break;
    }
  }

  console.log(`Total de vagas encontradas: ${todasAsVagas.length}`);

  fs.writeFileSync('todas_as_vagas.json', JSON.stringify(todasAsVagas, null, 2));

  // Novas verificações
  expect(todasAsVagas.length).toBe(18); // Verifica se o número total de vagas é 18
  for (const vaga of todasAsVagas) {
    expect(vaga.titulo).toBeTruthy();
    expect(vaga.localizacao).toBeTruthy();
    expect(vaga.tipo).toBeTruthy();
    expect(vaga.link).toBeTruthy();
  }

  // Verificação adicional para garantir que todas as vagas têm informações únicas
  const titulos = new Set(todasAsVagas.map(vaga => vaga.titulo));
  expect(titulos.size).toBe(todasAsVagas.length);
});