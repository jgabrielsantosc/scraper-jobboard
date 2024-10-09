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
exports.scraperJobSolidesHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const scraperJobSolidesHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL não fornecida' });
        return;
    }
    try {
        const companyName = new URL(url).hostname.split('.')[0];
        const firstPageResponse = yield axios_1.default.get(`https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=1&slug=${companyName}`);
        const totalPages = firstPageResponse.data.data.totalPages;
        const allJobs = [];
        for (let page = 1; page <= totalPages; page++) {
            const response = yield axios_1.default.get(`https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=${page}&slug=${companyName}`);
            allJobs.push(...response.data.data.data);
        }
        const baseUrl = `https://${companyName}.vagas.solides.com.br/vaga/`;
        const jobUrls = allJobs.map(job => `${baseUrl}${job.id}`);
        if (jobUrls.length === 0) {
            res.status(404).json({ error: 'Nenhuma vaga encontrada' });
        }
        else {
            res.json({ totalVagas: jobUrls.length, vagas: jobUrls });
        }
    }
    catch (error) {
        console.error('Erro ao coletar informações das vagas:', error);
        res.status(500).json({ error: 'Erro ao coletar informações das vagas' });
    }
});
exports.scraperJobSolidesHandler = scraperJobSolidesHandler;
