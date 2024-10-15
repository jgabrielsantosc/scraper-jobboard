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
exports.jobGreenhouseHandler = void 0;
const playwright_1 = require("playwright");
const jobGreenhouseHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log(`Navegando para a URL: ${url}`);
        yield page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        const bodyContent = yield page.evaluate(() => {
            const body = document.body;
            return body.innerText;
        });
        console.log('Conteúdo do body coletado');
        if (!bodyContent) {
            throw new Error('Não foi possível extrair o conteúdo da página');
        }
        res.json({ content: bodyContent });
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.jobGreenhouseHandler = jobGreenhouseHandler;
