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
const scraperJobGupy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }
    try {
        const browser = yield playwright_1.chromium.launch();
        const context = yield browser.newContext();
        const page = yield context.newPage();
        yield page.goto(url);
        yield page.waitForLoadState('networkidle');
        let todasAsVagas = [];
        let paginaAtual = 1;
        while (true) {
            const vagasDaPagina = yield coletarInformacoesDaPagina(page);
            todasAsVagas = todasAsVagas.concat(vagasDaPagina);
            const botaoProxima = page.locator('[data-testid="pagination-next-button"]');
            const botaoProximaDesabilitado = yield botaoProxima.getAttribute('disabled');
            if (botaoProximaDesabilitado === null) {
                yield botaoProxima.click();
                yield page.waitForLoadState('networkidle');
                paginaAtual++;
            }
            else {
                break;
            }
        }
        yield browser.close();
        res.json({ totalVagas: todasAsVagas.length, vagas: todasAsVagas });
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
    }
});
exports.scraperJobGupy = scraperJobGupy;
function coletarInformacoesDaPagina(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const vagas = yield page.locator('[data-testid="job-list__listitem"]').all();
        const informacoes = [];
        for (const vaga of vagas) {
            const titulo = yield vaga.locator('.sc-f5007364-4').textContent();
            const localizacao = yield vaga.locator('.sc-f5007364-5').textContent();
            const tipo = yield vaga.locator('.sc-f5007364-6').textContent();
            const link = yield vaga.locator('[data-testid="job-list__listitem-href"]').getAttribute('href');
            informacoes.push({
                titulo: titulo === null || titulo === void 0 ? void 0 : titulo.trim(),
                localizacao: localizacao === null || localizacao === void 0 ? void 0 : localizacao.trim(),
                tipo: tipo === null || tipo === void 0 ? void 0 : tipo.trim(),
                link: link ? `${new URL(page.url()).origin}${link}` : undefined
            });
        }
        return informacoes;
    });
}
