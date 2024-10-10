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
exports.scraperJobGupy = void 0;
const playwright_1 = require("playwright");
const scraperJobGupy = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const jobUrls = [];
    const browser = yield playwright_1.chromium.launch({ headless: true });
    const context = yield browser.newContext();
    const page = yield context.newPage();
    try {
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        while (true) {
            const newUrls = yield coletarUrlsDaPagina(page);
            jobUrls.push(...newUrls);
            const botaoProxima = page.locator('[data-testid="pagination-next-button"]');
            const botaoProximaDesabilitado = yield botaoProxima.getAttribute('disabled');
            if (botaoProximaDesabilitado === null) {
                yield botaoProxima.click();
                yield page.waitForLoadState('networkidle');
            }
            else {
                break;
            }
        }
        return jobUrls;
    }
    finally {
        yield browser.close();
    }
});
exports.scraperJobGupy = scraperJobGupy;
function coletarUrlsDaPagina(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = new URL(page.url()).origin;
        return page.evaluate((baseUrl) => {
            const links = document.querySelectorAll('[data-testid="job-list__listitem-href"]');
            return Array.from(links).map(link => {
                const href = link.getAttribute('href');
                return href ? new URL(href, baseUrl).href : null;
            }).filter(Boolean);
        }, baseUrl);
    });
}
