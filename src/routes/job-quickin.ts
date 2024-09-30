import { Request, Response, NextFunction } from 'express';
import { chromium } from 'playwright';
import { convert, HtmlToTextOptions } from 'html-to-text';
import { ExpressHandler } from '../types';

export const jobQuickinHandler: ExpressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'URL não fornecida' });
    return;
  }

  let browser = null;
  let page = null;

  try {
    // Validate URL
    new URL(url);

    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto(url);
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
    const h5Elements = page.locator('h5.title');
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

    const htmlToTextOptions: HtmlToTextOptions = {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    };

    // Convert HTML to clean text
    const allContent = convert(allContentHTML, htmlToTextOptions);
    const requirements = convert(requirementsHTML, htmlToTextOptions);
    const benefits = convert(benefitsHTML, htmlToTextOptions);

    res.status(200).json({
      title: title?.trim(),
      contract_model: contractModel?.trim(),
      location: location?.trim(),
      work_model: workModel?.trim(),
      all_content: allContent,
      requirements,
      benefits
    });
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
};