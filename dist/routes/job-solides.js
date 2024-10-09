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
exports.jobSolidesHandler = void 0;
const playwright_1 = require("playwright");
const jobSolidesHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const titleElement = document.querySelector('h1 > div > span') || document.querySelector('h1.text-subtitle1.font-semibold');
            const title = titleElement ? (_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim() : '';
            const locationElement = document.querySelector('[data-testid="locale-info"]');
            const location = locationElement ? (_b = locationElement.textContent) === null || _b === void 0 ? void 0 : _b.trim() : '';
            const contractTypeElement = document.querySelector('[data-cy="badges_contract_type"] div');
            const contractType = contractTypeElement ? (_c = contractTypeElement.textContent) === null || _c === void 0 ? void 0 : _c.trim() : '';
            const jobTypeElement = document.querySelector('[data-cy="badges_job_type"] div');
            const jobType = jobTypeElement ? (_d = jobTypeElement.textContent) === null || _d === void 0 ? void 0 : _d.trim() : '';
            const seniorityElement = document.querySelector('[data-cy="badges_seniority"] div');
            const seniority = seniorityElement ? (_e = seniorityElement.textContent) === null || _e === void 0 ? void 0 : _e.trim() : '';
            const description = ((_g = (_f = document.querySelector('[data-cy="description"]')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim()) || '';
            const educationElements = Array.from(document.querySelectorAll('[data-cy="vacancy-educations"] li')).map(li => { var _a; return (_a = li.textContent) === null || _a === void 0 ? void 0 : _a.trim(); });
            const educations = educationElements.filter(Boolean).join(', ');
            const addressElement = document.querySelector('[data-testid="how-to-get-location"]');
            const address = addressElement ? (_h = addressElement.textContent) === null || _h === void 0 ? void 0 : _h.trim() : '';
            return {
                title,
                location,
                contractType,
                jobType,
                seniority,
                description,
                educations,
                address
            };
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
exports.jobSolidesHandler = jobSolidesHandler;
