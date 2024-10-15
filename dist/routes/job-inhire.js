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
exports.jobInhireHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const jobInhireHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
    }
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v1/scrape';
    console.log('Variáveis de ambiente em job-inhire.ts:');
    console.log(`FIRECRAWL_API_URL: ${FIRECRAWL_API_URL}`);
    console.log(`FIRECRAWL_API_KEY: ${FIRECRAWL_API_KEY ? 'Definido' : 'Não definido'}`);
    if (!FIRECRAWL_API_KEY) {
        console.error('FIRECRAWL_API_KEY não está definido');
        res.status(500).json({ error: 'Erro de configuração do servidor' });
        return;
    }
    try {
        console.log(`Iniciando a extração de dados da URL: ${url}`);
        const response = yield axios_1.default.post(FIRECRAWL_API_URL, {
            url: url,
            formats: ['markdown'],
            waitFor: 5000
        }, {
            headers: {
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const { data } = response.data;
        if (!data || !data.markdown) {
            throw new Error('Dados não encontrados na resposta do Firecrawl');
        }
        console.log('Conteúdo da vaga extraído com sucesso');
        res.json({ content: data.markdown });
    }
    catch (error) {
        console.error('Erro ao coletar informações da vaga:', error);
        res.status(500).json({
            error: 'Erro ao coletar informações da vaga',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});
exports.jobInhireHandler = jobInhireHandler;
