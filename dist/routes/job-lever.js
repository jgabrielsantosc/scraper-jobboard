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
exports.jobLeverHandler = void 0;
const playwright_1 = require("playwright");
// ... (mantenha o código existente)
const jobLeverHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const jobInfo = yield page.evaluate(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const title = ((_b = (_a = document.querySelector('h2')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            const location_workmodel = ((_d = (_c = document.querySelector('.sort-by-time.posting-category.medium-category-label.width-full.capitalize-labels.location')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            const area = ((_f = (_e = document.querySelector('.sort-by-team.posting-category.medium-category-label.capitalize-labels.department')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim().replace('/', '')) || '';
            const type_job = ((_h = (_g = document.querySelector('.sort-by-commitment.posting-category.medium-category-label.capitalize-labels.commitment')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim().replace('/', '')) || '';
            const work_model = ((_k = (_j = document.querySelector('.sort-by-time.posting-category.medium-category-label.capitalize-labels.workplaceTypes')) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim()) || '';
            const description = ((_m = (_l = document.querySelector('.section.page-centered[data-qa="job-description"]')) === null || _l === void 0 ? void 0 : _l.textContent) === null || _m === void 0 ? void 0 : _m.trim()) || '';
            return { title, location_workmodel, area, type_job, work_model, description };
        });
        yield browser.close();
        if (!jobInfo.title && !jobInfo.description) {
            res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
        }
        else {
            res.json(jobInfo);
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
exports.jobLeverHandler = jobLeverHandler;
