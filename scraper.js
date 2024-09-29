const { chromium } = require('playwright');

async function scrapeJobs() {
  const browser = await chromium.launch({ headless: false }); // Defina como true para executar em modo headless
  const page = await browser.newPage();

  try {
    await page.goto('https://ambev.gupy.io/');

    // Esperar pelo carregamento dos elementos da página
    await page.waitForSelector('.job-list');

    // Extrair informações das vagas
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-list .job-list__item');
      return Array.from(jobElements).map(job => ({
        title: job.querySelector('.job-list__title')?.textContent.trim(),
        location: job.querySelector('.job-list__location')?.textContent.trim(),
        link: job.querySelector('a')?.href
      }));
    });

    console.log('Vagas encontradas:', jobs);

    // Aqui você pode adicionar lógica para salvar os dados no Supabase

  } catch (error) {
    console.error('Ocorreu um erro:', error);
  } finally {
    await browser.close();
  }
}

scrapeJobs();