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
exports.scraperJobWorkableHandler = void 0;
const playwright_1 = require("playwright");
const scraperJobWorkableHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Espera adicional para garantir que o conteúdo dinâmico seja carregado
        yield page.waitForTimeout(5000);
        // Seletor abrangente para todos os job boards
        const vagaSelector = '[data-ui="job"] a, [data-ui="job-opening"] a';
        // Aguardar o carregamento inicial das vagas
        yield page.waitForSelector(vagaSelector, { state: 'attached' });
        // Define um tempo limite para carregar as vagas (usado apenas para job boards com rolagem infinita)
        const timeout = 30000;
        const startTime = Date.now();
        let lastCount = 0;
        // Lógica de rolagem e clique no "Mostrar mais"
        while (Date.now() - startTime < timeout) {
            const loadMoreButton = yield page.locator('[data-ui="load-more-button"]');
            if ((yield loadMoreButton.isVisible()) && !(yield loadMoreButton.isDisabled())) {
                yield loadMoreButton.click();
                // Aguardar novas vagas
                try {
                    yield page.waitForSelector(vagaSelector, { state: 'attached' });
                }
                catch (error) {
                    console.error('Erro ao aguardar o seletor:', error);
                    break;
                }
            }
            else {
                break;
            }
            // Role a página
            yield page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            yield page.waitForTimeout(2000);
            const currentCount = yield page.locator(vagaSelector).count();
            if (currentCount === lastCount) {
                break;
            }
            lastCount = currentCount;
        }
        // Extrair URLs das vagas
        const vagaUrls = yield page.$$eval(vagaSelector, (elements, baseUrl) => {
            return elements.map((el) => {
                const urlPath = el.getAttribute('href') || '';
                return urlPath ? new URL(urlPath, baseUrl).href : '';
            });
        }, url);
        // Remover URLs duplicadas
        const uniqueUrls = [...new Set(vagaUrls)];
        yield browser.close();
        if (uniqueUrls.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: uniqueUrls.length, vagas: uniqueUrls });
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
exports.scraperJobWorkableHandler = scraperJobWorkableHandler;
