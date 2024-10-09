"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQuickinHandler = void 0;
const playwright_1 = require("playwright");
const html_to_text_1 = require("html-to-text");
const jobQuickinHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        browser = yield playwright_1.chromium.launch();
        page = yield browser.newPage();
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        // Scroll to ensure all elements are loaded
        yield page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        yield page.waitForTimeout(2000); // Wait 2 seconds to ensure content is loaded
        const title = yield page.locator('h1[data-v-4491386a]').textContent();
        const contractModel = yield page.locator('span[data-v-4491386a]').first().textContent();
        const location = yield page.locator('span[data-v-4491386a]').nth(1).textContent();
        const workModel = yield page.locator('span.badge-secondary[data-v-4491386a]').textContent();
        const allContentHTML = yield page.locator('div.mb-4[data-v-4491386a]').innerHTML();
        // Initialize variables
        let requirementsHTML = '';
        let benefitsHTML = '';
        // Locate all h5 elements with class 'title'
        const h5Elements = page.locator('h5.title');
        const count = yield h5Elements.count();
        for (let i = 0; i < count; i++) {
            const h5Element = h5Elements.nth(i);
            const h5Text = yield h5Element.textContent();
            const headingText = h5Text === null || h5Text === void 0 ? void 0 : h5Text.trim().toLowerCase();
            if (headingText === 'requirements' || headingText === 'requisitos') {
                requirementsHTML = yield h5Element.locator('xpath=following-sibling::div[1]').innerHTML().catch(() => '');
            }
            else if (headingText === 'benefits' || headingText === 'benefícios') {
                benefitsHTML = yield h5Element.locator('xpath=following-sibling::div[1]').innerHTML().catch(() => '');
            }
        }
        const htmlToTextOptions = {
            wordwrap: false,
            selectors: [
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' }
            ]
        };
        // Convert HTML to clean text
        const allContent = (0, html_to_text_1.convert)(allContentHTML, htmlToTextOptions);
        const requirements = (0, html_to_text_1.convert)(requirementsHTML, htmlToTextOptions);
        const benefits = (0, html_to_text_1.convert)(benefitsHTML, htmlToTextOptions);
        res.status(200).json({
            title: title === null || title === void 0 ? void 0 : title.trim(),
            contract_model: contractModel === null || contractModel === void 0 ? void 0 : contractModel.trim(),
            location: location === null || location === void 0 ? void 0 : location.trim(),
            work_model: workModel === null || workModel === void 0 ? void 0 : workModel.trim(),
            all_content: allContent,
            requirements,
            benefits
        });
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
    }
    finally {
        if (page)
            yield page.close();
        if (browser)
            yield browser.close();
    }
});
exports.jobQuickinHandler = jobQuickinHandler;
