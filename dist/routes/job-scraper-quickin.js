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
exports.scraperJobQuickinHandler = void 0;
const playwright_1 = require("playwright");
const scraperJobQuickinHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const jobUrls = yield page.$$eval('tr[data-v-4491386a] a.text-dark', links => links.map(link => link.href));
        yield browser.close();
        res.json({ totalVagas: jobUrls.length, vagas: jobUrls });
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.scraperJobQuickinHandler = scraperJobQuickinHandler;
