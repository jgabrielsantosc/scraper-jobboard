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
exports.scraperJobAblerHandler = void 0;
const playwright_1 = require("playwright");
const scraperJobAblerHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield page.waitForSelector('table.table');
        let allVagas = [];
        let hasNextPage = true;
        while (hasNextPage) {
            const vagasDaPagina = yield extrairVagas(page);
            allVagas = allVagas.concat(vagasDaPagina);
            hasNextPage = yield verificarProximaPagina(page);
            if (hasNextPage) {
                yield clicarProximaPagina(page);
                yield page.waitForTimeout(3000);
            }
        }
        yield browser.close();
        if (allVagas.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: allVagas.length, vagas: allVagas });
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
exports.scraperJobAblerHandler = scraperJobAblerHandler;
function extrairVagas(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return page.evaluate(() => {
            const rows = document.querySelectorAll('table.table tbody tr');
            return Array.from(rows).map(row => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                const title = (_b = (_a = row.querySelector('strong')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                const url = (_c = row.querySelector('a.btn-apply')) === null || _c === void 0 ? void 0 : _c.getAttribute('href');
                const pub_date = (_e = (_d = row.querySelector('td:nth-child(2)')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim();
                const seniority = (_g = (_f = row.querySelector('td:nth-child(3)')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim();
                const contract_model = (_j = (_h = row.querySelector('td:nth-child(4)')) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.trim();
                const location = (_l = (_k = row.querySelector('td:nth-child(5)')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.trim();
                return { title, url, pub_date, seniority, contract_model, location };
            });
        });
    });
}
function verificarProximaPagina(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return page.evaluate(() => {
            const nextButton = document.querySelector('li.page-item button.page-link[aria-label="Go to next page"]');
            return nextButton !== null && !nextButton.hasAttribute('disabled');
        });
    });
}
function clicarProximaPagina(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.click('li.page-item button.page-link[aria-label="Go to next page"]');
    });
}
