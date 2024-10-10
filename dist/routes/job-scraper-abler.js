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
        let allUrls = [];
        let hasNextPage = true;
        while (hasNextPage) {
            const urlsDaPagina = yield extrairUrls(page);
            allUrls = allUrls.concat(urlsDaPagina);
            hasNextPage = yield verificarProximaPagina(page);
            if (hasNextPage) {
                yield clicarProximaPagina(page);
                yield page.waitForTimeout(3000);
            }
        }
        yield browser.close();
        if (allUrls.length === 0) {
            res.status(404).json([]);
        }
        else {
            res.json(allUrls);
        }
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        res.status(500).json([]);
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.scraperJobAblerHandler = scraperJobAblerHandler;
function extrairUrls(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return page.evaluate(() => {
            const rows = document.querySelectorAll('table.table tbody tr');
            return Array.from(rows).map(row => {
                var _a;
                const url_job = (_a = row.querySelector('a.btn-apply')) === null || _a === void 0 ? void 0 : _a.getAttribute('href');
                return url_job;
            }).filter(Boolean);
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
