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
exports.scraperJobInhireHandler = void 0;
const playwright_1 = require("playwright");
const scraperJobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        yield page.waitForSelector('.css-jswd32.eicjt3c5', { timeout: 90000 });
        yield page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        yield page.waitForTimeout(2000);
        const vagas = yield page.$$eval('.css-jswd32.eicjt3c5 li', (elements, baseUrl) => {
            return elements.map((el) => {
                var _a, _b;
                const titleElement = el.querySelector('[data-sentry-element="JobPositionName"]');
                const linkElement = el.querySelector('a[data-sentry-element="NavLink"]');
                return {
                    title_job: (_b = (_a = titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '',
                    url_job: linkElement ? `${baseUrl}${linkElement.getAttribute('href')}` : '',
                };
            });
        }, url); // Passando a URL base como segundo argumento
        console.log(JSON.stringify(vagas, null, 2));
        console.log(`Total de vagas encontradas: ${vagas.length}`);
        if (vagas.length === 0) {
            res.status(404).json({ totalVagas: 0, vagas: [], message: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({
                totalVagas: vagas.length,
                vagas: vagas,
            });
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
exports.scraperJobInhireHandler = scraperJobInhireHandler;
