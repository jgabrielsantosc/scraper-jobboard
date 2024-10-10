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
exports.scraperJobGreenhouse = scraperJobGreenhouse;
const playwright_1 = require("playwright");
function scraperJobGreenhouse(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext();
        const page = yield context.newPage();
        try {
            yield page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            const links = yield page.evaluate(() => {
                const jobLinks = document.querySelectorAll('a[href*="/jobs/"]');
                return Array.from(jobLinks).map(link => link.getAttribute('href')).filter(Boolean);
            });
            return links;
        }
        catch (error) {
            console.error('Erro ao coletar informações da vaga:', error);
            throw new Error('Erro ao coletar informações da vaga');
        }
        finally {
            yield browser.close();
        }
    });
}
