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
function randomDelay() {
    return __awaiter(this, arguments, void 0, function* (min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        yield new Promise(resolve => setTimeout(resolve, delay));
    });
}
const scraperJobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
    }
    let browser = null;
    let context = null;
    let page = null;
    try {
        console.log('Iniciando o navegador...');
        browser = yield playwright_1.chromium.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-zygote',
                '--single-process',
                '--disable-web-security',
            ],
        });
        context = yield browser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            geolocation: { longitude: -46.6333, latitude: -23.5505 },
            permissions: ['geolocation'],
            timezoneId: 'America/Sao_Paulo',
            viewport: { width: 1280, height: 720 },
        });
        yield context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });
        page = yield context.newPage();
        // Add event listeners
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.error('PAGE ERROR:', error));
        page.on('response', response => {
            if (!response.ok()) {
                console.error(`Network error: ${response.url()} status=${response.status()}`);
            }
        });
        console.log(`Navegando para a URL: ${url}`);
        yield page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        yield randomDelay();
        // Capture screenshot after navigation
        yield page.screenshot({ path: 'after-goto.png', fullPage: true });
        console.log('Esperando o seletor a[data-sentry-element="NavLink"]...');
        yield page.waitForSelector('a[data-sentry-element="NavLink"]', { state: 'visible', timeout: 60000 });
        yield randomDelay();
        // Capture page content
        const pageContent = yield page.content();
        console.log('Page Content:', pageContent);
        const jobUrls = yield page.$$eval('a[data-sentry-element="NavLink"]', (links, baseUrl) => links.map(link => new URL(link.getAttribute('href') || '', baseUrl).href), url);
        console.log(`Total de vagas encontradas: ${jobUrls.length}`);
        res.json(jobUrls);
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        if (page) {
            console.log('Capturando screenshot e conteúdo da página...');
            yield page.screenshot({ path: 'error-screenshot.png', fullPage: true });
            const pageContent = yield page.content();
            console.log('Conteúdo da página:', pageContent);
        }
        res.status(500).json({ error: 'Erro ao coletar informações das vagas', details: error.message, stack: error.stack });
    }
    finally {
        if (page)
            yield page.close();
        if (context)
            yield context.close();
        if (browser)
            yield browser.close();
    }
});
exports.scraperJobInhireHandler = scraperJobInhireHandler;
