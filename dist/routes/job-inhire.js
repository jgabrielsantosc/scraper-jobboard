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
exports.jobInhireHandler = void 0;
const playwright_1 = require("playwright");
const jobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
    }
    let browser;
    try {
        browser = yield playwright_1.chromium.launch({ headless: true });
        const context = yield browser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/85.0.4183.83 Safari/537.36',
            geolocation: { longitude: -46.6333, latitude: -23.5505 }, // Coordenadas de São Paulo, Brasil
            permissions: ['geolocation'],
            timezoneId: 'America/Sao_Paulo', // Fuso horário de São Paulo
        });
        const page = yield context.newPage();
        // Navegar para a URL fornecida
        yield page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Aguarde os elementos necessários carregarem
        yield page.waitForSelector('h1[data-component-name="Jumbo"]', { timeout: 60000 });
        yield page.waitForSelector('span[data-component-name="Text"]', { timeout: 60000 });
        yield page.waitForSelector('.css-i3pbo.e5r6srz1', { timeout: 60000 });
        // Extrair as informações da vaga
        const title = yield page.locator('h1[data-component-name="Jumbo"]').textContent();
        const workModel = yield page.locator('span[data-component-name="Text"]').first().textContent();
        const location = yield page.locator('span[data-component-name="Text"]').nth(1).textContent();
        const descricao = yield page.locator('.css-i3pbo.e5r6srz1').first().textContent();
        console.log('Título:', title);
        console.log('Modelo de Trabalho:', workModel);
        console.log('Localização:', location);
        console.log('Descrição:', descricao);
        // Verificar se as informações foram coletadas
        if (!title && !workModel && !location && !descricao) {
            res.status(404).json({ error: 'Não foi possível encontrar informações da vaga' });
        }
        else {
            const jobInfo = {
                title: title ? title.trim() : '',
                workModel: workModel ? workModel.trim() : '',
                location: location ? location.trim() : '',
                description: descricao ? descricao.trim() : '',
            };
            res.json(jobInfo);
        }
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Erro ao coletar informações da vaga', details: 'Erro desconhecido' });
        }
        return;
    }
    finally {
        if (browser) {
            yield browser.close();
        }
    }
});
exports.jobInhireHandler = jobInhireHandler;
