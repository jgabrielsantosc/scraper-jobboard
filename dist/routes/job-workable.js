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
exports.jobWorkableHandler = void 0;
const playwright_1 = require("playwright");
const html_to_text_1 = require("html-to-text");
const jobWorkableHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }
    let browser;
    try {
        browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext();
        const page = yield context.newPage();
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        // Capturar todo o conteúdo do body
        const bodyContent = yield page.evaluate(() => {
            return document.body.innerHTML;
        });
        // Converter o HTML para texto com espaçamento
        const textContent = (0, html_to_text_1.convert)(bodyContent, {
            wordwrap: 130,
            preserveNewlines: true,
            selectors: [
                { selector: 'h1', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
                { selector: 'h2', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
                { selector: 'h3', options: { uppercase: false, prefix: '\n\n', suffix: '\n' } },
                { selector: 'p', options: { prefix: '\n', suffix: '\n' } },
                { selector: 'br', options: { format: 'inline', prefix: '\n' } },
                { selector: 'ul', options: { itemPrefix: '\n • ' } },
                { selector: 'ol', options: { itemPrefix: '\n  ' } },
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' }
            ]
        });
        // Limpar espaços em branco excessivos
        const cleanedContent = textContent
            .replace(/\n\s+\n/g, '\n\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        yield browser.close();
        res.json({
            content: cleanedContent,
            formattedContent: cleanedContent.split('\n')
        });
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.jobWorkableHandler = jobWorkableHandler;
