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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperJobInhireHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const scraperJobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
    }
    console.log('Variáveis de ambiente em job-scraper-inhire.ts:');
    console.log(`FIRECRAWL_API_URL: ${process.env.FIRECRAWL_API_URL}`);
    console.log(`FIRECRAWL_API_KEY: ${process.env.FIRECRAWL_API_KEY ? 'Definido' : 'Não definido'}`);
    if (!process.env.FIRECRAWL_API_URL) {
        res.status(500).json({ error: 'FIRECRAWL_API_URL não está definido' });
        return;
    }
    if (!process.env.FIRECRAWL_API_KEY) {
        res.status(500).json({ error: 'FIRECRAWL_API_KEY não está definido' });
        return;
    }
    try {
        // Garantir que a URL comece com 'https://'
        if (!url.startsWith('https://')) {
            url = 'https://' + url;
        }
        // Validar a URL
        try {
            new URL(url);
        }
        catch (error) {
            res.status(400).json({ error: 'URL inválida fornecida' });
            return;
        }
        console.log(`Iniciando a extração de dados da URL: ${url}`);
        // Verificar se a URL termina com '/vagas' e adicionar se necessário
        if (!url.endsWith('/vagas')) {
            url += '/vagas';
        }
        console.log(`Fazendo requisição para: ${process.env.FIRECRAWL_API_URL}`);
        const response = yield axios_1.default.post(process.env.FIRECRAWL_API_URL, {
            url: url,
            formats: ['links'],
            waitFor: 5000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Resposta recebida do Firecrawl');
        const { data } = response.data;
        if (!data || !data.links) {
            throw new Error('Dados não encontrados na resposta do Firecrawl');
        }
        const jobUrls = data.links.filter((link) => {
            // Verifica se o link é uma URL válida
            try {
                new URL(link);
            }
            catch (_a) {
                return false;
            }
            // Verifica se o link contém '/vagas/' e não é a página principal de vagas
            return link.includes('/vagas/') && !link.endsWith('/vagas');
        });
        console.log(`Total de vagas encontradas: ${jobUrls.length}`);
        res.json(jobUrls);
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        res.status(500).json({
            error: 'Erro ao coletar informações das vagas',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.scraperJobInhireHandler = scraperJobInhireHandler;
