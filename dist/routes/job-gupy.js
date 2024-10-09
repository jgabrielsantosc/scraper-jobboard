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
exports.jobGupyHandler = void 0;
const playwright_1 = require("playwright");
/**
 * Manipula a requisição para coletar informações de uma vaga no Gupy
 * @param req - Objeto de requisição Express
 * @param res - Objeto de resposta Express
 */
const jobGupyHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
    }
    try {
        const browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext();
        const page = yield context.newPage();
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        yield page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        yield page.waitForTimeout(2000);
        const infoDetalhada = yield page.evaluate(() => {
            function getTextContent(selector, index = 0) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > index) {
                    const text = elements[index].textContent;
                    return text ? text.trim() : '';
                }
                return '';
            }
            return {
                type_job: getTextContent('.sc-dfd42894-0.bzQMFp', 0),
                work_model: getTextContent('.sc-dfd42894-0.bzQMFp', 1),
                pcd: getTextContent('.sc-dfd42894-0.bzQMFp', 2),
                pub_job: getTextContent('.sc-ccd5d36-11.dmmNfl', 0),
                deadline: getTextContent('.sc-ccd5d36-11.dmmNfl', 1),
                description_job: getTextContent('.sc-add46fb1-3.cOkxvQ', 0),
                requirements: getTextContent('.sc-add46fb1-3.cOkxvQ', 1),
                infos_extras: getTextContent('.sc-add46fb1-3.cOkxvQ', 2) || ' ',
                etapas: getTextContent('.sc-c87ac0d4-0.gDozGp', 0) || ' ',
                about: getTextContent('.sc-add46fb1-3.cOkxvQ', 3) || ' ',
            };
        });
        yield browser.close();
        res.json(infoDetalhada);
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        res.status(500).json({ error: 'Erro ao coletar informações da vaga' });
    }
});
exports.jobGupyHandler = jobGupyHandler;
