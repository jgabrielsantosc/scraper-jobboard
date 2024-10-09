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
exports.scraperJobGreenhouse = void 0;
const playwright_1 = require("playwright");
const scraperJobGreenhouse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }
    try {
        const browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext();
        const page = yield context.newPage();
        yield page.goto(url, { timeout: 60000, waitUntil: 'networkidle' });
        const vagas = yield page.evaluate(() => {
            const jobPosts = document.querySelectorAll('.job-posts');
            const resultado = [];
            jobPosts.forEach((jobPost) => {
                var _a, _b;
                const area = ((_b = (_a = jobPost.querySelector('.section-header')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                const vagasArea = jobPost.querySelectorAll('.job-post');
                vagasArea.forEach((vaga) => {
                    var _a, _b, _c, _d, _e;
                    const title = ((_b = (_a = vaga.querySelector('.body--medium')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                    const location = ((_d = (_c = vaga.querySelector('.body--metadata')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '';
                    const link = ((_e = vaga.querySelector('a')) === null || _e === void 0 ? void 0 : _e.getAttribute('href')) || '';
                    resultado.push({ area, title, location, link });
                });
            });
            return resultado;
        });
        yield browser.close();
        if (vagas.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: vagas.length, vagas });
        }
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: `Erro ao coletar informações das vagas: ${error.message}` });
        }
        else {
            res.status(500).json({ error: 'Erro desconhecido ao coletar informações das vagas' });
        }
    }
});
exports.scraperJobGreenhouse = scraperJobGreenhouse;
