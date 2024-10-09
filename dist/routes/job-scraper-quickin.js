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
        const jobCards = yield page.$$('tr[data-v-4491386a]');
        const jobs = [];
        for (const jobCard of jobCards) {
            const title = yield jobCard.$eval('a.text-dark', el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); });
            const link = yield jobCard.$eval('a.text-dark', el => el.href);
            const location = yield jobCard.$eval('td span[data-v-4491386a]', el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); });
            const workModel = yield jobCard.$eval('td span.badge-secondary', el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); });
            jobs.push({ title, link, location, work_model: workModel });
        }
        yield browser.close();
        if (jobs.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: jobs.length, vagas: jobs });
        }
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
