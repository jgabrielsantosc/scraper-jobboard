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
exports.scraperJobLeverHandler = void 0;
const playwright_1 = require("playwright");
const scraperJobLeverHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const jobListings = yield page.evaluate(() => {
            const jobGroups = document.querySelectorAll('.postings-group');
            const jobs = [];
            jobGroups.forEach((group) => {
                var _a, _b;
                const area = ((_b = (_a = group.querySelector('.large-category-header')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                const jobCards = group.querySelectorAll('.posting');
                jobCards.forEach((card) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    const title = ((_b = (_a = card.querySelector('[data-qa="posting-name"]')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                    const url_job = ((_c = card.querySelector('.posting-btn-submit')) === null || _c === void 0 ? void 0 : _c.getAttribute('href')) || '';
                    const work_model = ((_e = (_d = card.querySelector('.workplaceTypes')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim().replace('—', '').trim()) || '';
                    const type_job = ((_g = (_f = card.querySelector('.commitment')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || '';
                    const location = ((_j = (_h = card.querySelector('.location')) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim()) || '';
                    jobs.push({
                        area,
                        title,
                        url_job,
                        work_model,
                        type_job,
                        location
                    });
                });
            });
            return jobs;
        });
        yield browser.close();
        if (jobListings.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: jobListings.length, vagas: jobListings });
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
exports.scraperJobLeverHandler = scraperJobLeverHandler;
