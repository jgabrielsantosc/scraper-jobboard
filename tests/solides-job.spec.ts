import { test, expect, chromium } from '@playwright/test';

test('extrair informações da vaga Solides', async ({ page }) => {
  const url = 'https://bwtech.vagas.solides.com.br/vaga/473958';
  await page.goto(url, { waitUntil: 'networkidle' });

  const jobInfo = await page.evaluate(() => {
    const titleElement = document.querySelector('h1') as HTMLElement;
    let title = titleElement ? titleElement.textContent?.trim() : '';

    const locationElement = document.querySelector('[data-testid="locale-info"]') as HTMLElement;
    const location = locationElement ? locationElement.textContent?.trim() : '';

    const contractTypeElement = document.querySelector('[data-cy="badges_contract_type"] div') as HTMLElement;
    const contractType = contractTypeElement ? contractTypeElement.textContent?.trim() : '';

    const jobTypeElement = document.querySelector('[data-cy="badges_job_type"] div') as HTMLElement;
    const jobType = jobTypeElement ? jobTypeElement.textContent?.trim() : '';

    const seniorityElement = document.querySelector('[data-cy="badges_seniority"] div') as HTMLElement;
    const seniority = seniorityElement ? seniorityElement.textContent?.trim() : '';

    const description = document.querySelector('[data-cy="description"]')?.textContent?.trim() || '';

    const educationElements = Array.from(document.querySelectorAll('[data-cy="vacancy-educations"] li')).map(li => li.textContent?.trim());
    const educations = educationElements.filter(Boolean).join(', ');

    const addressElement = document.querySelector('[data-testid="how-to-get-location"]') as HTMLElement;
    const address = addressElement ? addressElement.textContent?.trim() : '';

    return { 
      title, 
      location, 
      contractType, 
      jobType, 
      seniority, 
      description, 
      educations, 
      address 
    };
  });

  console.log(`Informações da vaga:`, jobInfo);

  expect(jobInfo.title).toBeTruthy();
  expect(jobInfo.location).toBeTruthy();
  expect(jobInfo.description).toBeTruthy();
});