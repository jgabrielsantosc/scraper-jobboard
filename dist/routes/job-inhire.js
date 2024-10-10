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
function randomDelay() {
    return __awaiter(this, arguments, void 0, function* (min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        yield new Promise((resolve) => setTimeout(resolve, delay));
    });
}
const jobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        context = yield browser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            geolocation: { longitude: -46.6333, latitude: -23.5505 },
            permissions: ['geolocation'],
            timezoneId: 'America/Sao_Paulo',
            viewport: { width: 1280, height: 720 },
            locale: 'pt-BR',
        });
        // Técnicas anti-detecção
        yield context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        });
        page = yield context.newPage();
        // Capturar logs e erros
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', (err) => console.log('PAGE ERROR:', err));
        console.log('Navegando para a URL:', url);
        yield page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        console.log('Página carregada');
        yield randomDelay();
        // Aguarda um seletor que indica que o conteúdo foi carregado
        const contentSelector = '#root';
        yield page.waitForSelector(contentSelector, { state: 'attached', timeout: 120000 });
        console.log('Conteúdo principal disponível');
        yield randomDelay();
        // Simula comportamento humano
        yield page.mouse.move(100, 100);
        yield page.mouse.down();
        yield page.mouse.move(200, 200);
        yield page.mouse.up();
        yield randomDelay();
        // Avalia o conteúdo da página
        const content = yield page.evaluate(() => {
            const element = document.querySelector('#root');
            return element ? element.innerText : '';
        });
        // Processa o conteúdo
        const cleanContent = content.trim();
        // Retorna o conteúdo
        res.json({
            content: cleanContent,
            formattedContent: cleanContent.split('\n'),
        });
        console.log('Conteúdo encontrado:', cleanContent.substring(0, 100) + '...');
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        if (page) {
            console.log('Capturando screenshot e conteúdo da página...');
            yield page.screenshot({ path: 'error-screenshot.png', fullPage: true });
            const pageContent = yield page.content();
            console.log('Conteúdo da página:', pageContent);
        }
        res.status(500).json({
            error: 'Erro ao coletar informações da vaga',
            details: error.message,
            stack: error.stack,
        });
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
exports.jobInhireHandler = jobInhireHandler;
