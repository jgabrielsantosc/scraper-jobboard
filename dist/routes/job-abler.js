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
exports.jobAblerHandler = void 0;
const playwright_1 = require("playwright");
const jobAblerHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const title = ((_b = (_a = document.querySelector('h1')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            const jobType = ((_d = (_c = document.querySelector('.small.text-center')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            const location = ((_f = (_e = document.querySelector('tr:nth-child(2) td:nth-child(2)')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
            const description = ((_h = (_g = document.querySelector('.card-body.card-description')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '';
            const infoRows = document.querySelectorAll('tr');
            let area = '';
            let requirements = '';
            let benefits = '';
            infoRows.forEach((row) => {
                var _a, _b, _c, _d;
                const label = ((_b = (_a = row.querySelector('th')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                const value = ((_d = (_c = row.querySelector('td')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
                if (label.includes('Área da vaga')) {
                    area = value;
                }
                else if (label.includes('Nível de escolaridade')) {
                    requirements = value;
                }
                else if (label.includes('Benefícios')) {
                    benefits = value;
                }
            });
            return { title, jobType, location, area, description, requirements, benefits };
        });
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
exports.jobAblerHandler = jobAblerHandler;
