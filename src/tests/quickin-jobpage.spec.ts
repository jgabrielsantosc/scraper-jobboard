import { test, expect } from '@playwright/test';
const { htmlToText } = require('html-to-text');

test('should extract detailed job information from Quickin', async ({ page }) => {
  await page.goto('https://jobs.quickin.io/koin/jobs/66f5c84ed7a208001334eedd');
  await page.waitForLoadState('networkidle');

  // Scroll to ensure all elements are loaded
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000); // Wait 2 seconds to ensure content is loaded

  const title = await page.locator('h1[data-v-4491386a]').textContent();
  const contractModel = await page.locator('span[data-v-4491386a]').first().textContent();
  const location = await page.locator('span[data-v-4491386a]').nth(1).textContent();
  const workModel = await page.locator('span.badge-secondary[data-v-4491386a]').textContent();
  const allContentHTML = await page.locator('div.mb-4[data-v-4491386a]').innerHTML();

  // Initialize variables
  let requirementsHTML = '';
  let benefitsHTML = '';

  // Locate all h5 elements with class 'title'
  const h5Elements = await page.locator('h5.title');
  const count = await h5Elements.count();

  for (let i = 0; i < count; i++) {
    const h5Element = h5Elements.nth(i);
    const h5Text = await h5Element.textContent();
    const headingText = h5Text?.trim().toLowerCase();

    if (headingText === 'requirements' || headingText === 'requisitos') {
      requirementsHTML = await h5Element.locator('xpath=following-sibling::div[1]').innerHTML().catch(() => '');
    } else if (headingText === 'benefits' || headingText === 'benefícios') {
      benefitsHTML = await h5Element.locator('xpath=following-sibling::div[1]').innerHTML().catch(() => '');
    }
  }

  // Convert HTML to clean text
  const allContent = htmlToText(allContentHTML, {
    wordwrap: false,
    uppercaseHeadings: false,
    singleNewLineParagraphs: true,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  }).trim();

  const requirements = htmlToText(requirementsHTML, {
    wordwrap: false,
    uppercaseHeadings: false,
    singleNewLineParagraphs: true
  }).trim();

  const benefits = htmlToText(benefitsHTML, {
    wordwrap: false,
    uppercaseHeadings: false,
    singleNewLineParagraphs: true
  }).trim();

  console.log({
    title: title?.trim(),
    contract_model: contractModel?.trim(),
    location: location?.trim(),
    work_model: workModel?.trim(),
    all_content: allContent,
    requirements: requirements,
    benefits: benefits
  });

  expect(title).toBeTruthy();
  expect(contractModel).toBeTruthy();
  expect(location).toBeTruthy();
  expect(workModel).toBeTruthy();
  expect(allContent).toBeTruthy();
});