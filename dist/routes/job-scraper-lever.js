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
exports.scraperJobLeverHandler = exports.scraperJobLever = void 0;
const playwright_1 = require("playwright");
const scraperJobLever = (url) => __awaiter(void 0, void 0, void 0, function* () {
    let browser;
    try {
        browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext();
        const page = yield context.newPage();
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        const jobUrls = yield page.evaluate(() => {
            const jobCards = document.querySelectorAll('.posting');
            return Array.from(jobCards)
                .map(card => { var _a; return ((_a = card.querySelector('.posting-btn-submit')) === null || _a === void 0 ? void 0 : _a.getAttribute('href')) || ''; })
                .filter(url => url !== '');
        });
        return jobUrls;
    }
    catch (error) {
        console.error('Erro ao coletar URLs das vagas:', error);
        throw error;
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.scraperJobLever = scraperJobLever;
const scraperJobLeverHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }
    try {
        const jobUrls = yield (0, exports.scraperJobLever)(url);
        res.json({ urls: jobUrls });
    }
    catch (error) {
        console.error('Erro ao coletar URLs das vagas:', error);
        res.status(500).json({ error: 'Erro ao coletar URLs das vagas' });
    }
});
exports.scraperJobLeverHandler = scraperJobLeverHandler;
