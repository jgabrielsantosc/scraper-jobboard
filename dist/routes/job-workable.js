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
exports.jobWorkableHandler = void 0;
const playwright_1 = require("playwright");
const html_to_text_1 = require("html-to-text");
const jobWorkableHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
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
        // Usando operador de coalescência nula (??)
        const title = (_a = (yield page.locator('h1[data-ui="job-title"], h3[data-ui="job-title"]').textContent())) !== null && _a !== void 0 ? _a : '';
        const workModel = (_b = (yield page.locator('span[data-ui="job-workplace"] strong').textContent())) !== null && _b !== void 0 ? _b : '';
        const typeJob = (_c = (yield page.locator('span[data-ui="job-type"]').textContent())) !== null && _c !== void 0 ? _c : '';
        const location = (_d = (yield page.locator('div[data-ui="job-location-tooltip"] span, div[data-ui="job-location"] [data-ellipsis-element="true"], div.styles--1Sarc.styles--Xn8hR [data-ellipsis-element="true"]').textContent())) !== null && _d !== void 0 ? _d : '';
        const descriptionHtml = (_e = (yield page.locator('section[data-ui="job-description"]').innerHTML())) !== null && _e !== void 0 ? _e : '';
        const description = (0, html_to_text_1.convert)(descriptionHtml, {
            wordwrap: false,
            selectors: [
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' }
            ]
        });
        const jobInfo = {
            title: title.trim(),
            workModel: workModel.trim(),
            typeJob: typeJob.trim(),
            location: location.trim(),
            description: description.trim(),
        };
        yield browser.close();
        res.json(jobInfo);
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.jobWorkableHandler = jobWorkableHandler;
