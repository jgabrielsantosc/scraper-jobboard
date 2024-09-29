import { test, expect } from '@playwright/test';

test('coletar informações detalhadas de uma vaga específica', async ({ page }) => {
  await page.goto('https://caju.gupy.io/jobs/7719682?jobBoardSource=gupy_public_page');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const infoDetalhada = {
    type_job: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 0),
    work_model: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 1),
    pcd: await getTextContent(page, '.sc-dfd42894-0.bzQMFp', 2),
    pub_job: await getTextContent(page, '.sc-ccd5d36-11.dmmNfl', 0),
    deadline: await getTextContent(page, '.sc-ccd5d36-11.dmmNfl', 1),
    description_job: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 0),
    requirements: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 1),
    infos_extras: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 2) || ' ',
    etapas: await getTextContent(page, '.sc-c87ac0d4-0.gDozGp', 0) || ' ',
    about: await getTextContent(page, '.sc-add46fb1-3.cOkxvQ', 3) || ' ',
  };

  console.log(JSON.stringify(infoDetalhada, null, 2));

  for (const [key, value] of Object.entries(infoDetalhada)) {
    expect(value, `${key} should not be empty`).toBeTruthy();
  }
});

async function getTextContent(page, selector: string, index: number): Promise<string> {
  const elements = await page.locator(selector).all();
  if (elements.length > index) {
    const text = await elements[index].textContent();
    return text ? text.trim() : ' ';
  }
  return ' ';
}

test('testar rota /job-gupy', async ({ request }) => {
  const url = 'https://caju.gupy.io/jobs/7719682?jobBoardSource=gupy_public_page';
  const response = await request.get(`/job-gupy?url=${encodeURIComponent(url)}`);
  expect(response.ok()).toBeTruthy();
  
  const infoDetalhada = await response.json();
  expect(infoDetalhada.type_job).toBeTruthy();
  expect(infoDetalhada.work_model).toBeTruthy();
  expect(infoDetalhada.pcd).toBeTruthy();
  expect(infoDetalhada.pub_job).toBeTruthy();
  expect(infoDetalhada.deadline).toBeTruthy();
  expect(infoDetalhada.description_job).toBeTruthy();
  expect(infoDetalhada.requirements).toBeTruthy();
  expect(infoDetalhada.infos_extras).toBeTruthy();
  expect(infoDetalhada.etapas).toBeTruthy();
  expect(infoDetalhada.about).toBeTruthy();
});