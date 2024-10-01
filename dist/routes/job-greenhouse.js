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
        yield page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const jobInfo = yield page.evaluate(() => {
            var _a, _b, _c, _d, _e, _f;
            const title = ((_b = (_a = document.querySelector('h1.section-header.section-header--large.font-primary')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            const location = ((_d = (_c = document.querySelector('p.body.body--metadata')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            const description = ((_f = (_e = document.querySelector('div.job__description.body')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
            return { title, location, description };
        });
        yield browser.close();
        if (!jobInfo.title && !jobInfo.location && !jobInfo.description) {
            res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
        }
        else {
            // Formatar a descrição para Markdown
            const formattedDescription = jobInfo.description.replace(/\n\n/g, '\n');
            res.json(Object.assign(Object.assign({}, jobInfo), { description: formattedDescription }));
        }
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
