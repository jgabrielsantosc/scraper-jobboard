import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const jobListings = [
  { company: 'quintoandar', url: 'https://apply.workable.com/quintoandar/j/5E4F3A7906/' },
  { company: 'pravaler', url: 'https://apply.workable.com/pravaler-1/j/42357AC575/' },
  { company: 'loggi', url: 'https://apply.workable.com/loggi/j/6291C81C5E/' },
  { company: 'axur', url: 'https://apply.workable.com/axur/j/DEDB8E1006/' },
  { company: 'nomadglobal', url: 'https://apply.workable.com/nomadglobal/j/70CC69D082/' },
];

test.describe('Extração de informações de vagas', () => {
  for (const { company, url } of jobListings) {
    test(`extrair informações da vaga ${company}`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const content = await page.content();
      fs.writeFileSync(`vaga_${company}.html`, content);

      console.log(`Conteúdo bruto da vaga ${company} salvo em vaga_${company}.html`);

      const htmlContent = fs.readFileSync(`vaga_${company}.html`, 'utf-8');
      const $ = cheerio.load(htmlContent);

      // Extrair informações da vaga usando seletores CSS específicos para cada empresa
      let title, workModel, typeJob, location, description;

      if (company === 'quintoandar') {
        title = $('h1[data-ui="job-title"]').text().trim();
        workModel = $('span[data-ui="job-workplace"] strong').text().trim();
        typeJob = $('span[data-ui="job-type"]').text().trim();
        location = $(
          'div[data-ui="job-location"] [data-ellipsis-element="true"]'
        )
          .text()
          .trim();
        description = $('section[data-ui="job-description"]')
          .text()
          .trim();
      } else if (company === 'pravaler') {
        title = $('h1[data-ui="job-title"]').text().trim();
        workModel = $('span[data-ui="job-workplace"] strong').text().trim();
        typeJob = ''; // Pravaler não possui 'job-type' na página individual
        location = $(
          'div[data-ui="job-location"] [data-ellipsis-element="true"]'
        )
          .text()
          .trim();
        description = $('section[data-ui="job-description"]')
          .text()
          .trim();
      } else if (company === 'loggi') {
        title = $('h1[data-ui="job-title"]').text().trim();
        workModel = $('span[data-ui="job-workplace"] strong').text().trim();
        typeJob = $('span[data-ui="job-type"]').text().trim() || ''; 
        location = $(
          'div[data-ui="job-location"] [data-ellipsis-element="true"]'
        )
          .text()
          .trim();
        description = $('section[data-ui="job-description"]')
          .text()
          .trim();
      } else if (company === 'axur') {
        title = $('h1[data-ui="job-title"]').text().trim();
        workModel = $('span[data-ui="job-workplace"] strong').text().trim();
        typeJob = $('span[data-ui="job-type"]').text().trim() || ''; 
        location = $(
          'div[data-ui="job-location"] [data-ellipsis-element="true"]'
        )
          .text()
          .trim();
        description = $('section[data-ui="job-description"]')
          .text()
          .trim();
      } else if (company === 'nomadglobal') {
        title = $('h1[data-ui="job-title"]').text().trim();
        workModel = $('span[data-ui="job-workplace"] strong').text().trim();
        typeJob = $('span[data-ui="job-type"]').text().trim();
        location = $(
          'div.styles--1Sarc.styles--Xn8hR [data-ellipsis-element="true"]'
        )
          .text()
          .trim();
        description = $('section[data-ui="job-description"]')
          .text()
          .trim();
      }

      console.log(`Informações da vaga ${company}:`, {
        title,
        workModel,
        typeJob,
        location,
        description,
      });

      // Exemplo de asserção
      await expect(page.locator('h1[data-ui="job-title"]')).toHaveText(title);

      // (Opcional) Asserções para testar a extração dos dados
      // ...
    });
  }
});