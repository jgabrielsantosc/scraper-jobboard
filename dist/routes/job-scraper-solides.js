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
exports.scraperJobSolides = void 0;
const axios_1 = __importDefault(require("axios"));
const scraperJobSolides = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const companyName = new URL(url).hostname.split('.')[0];
    const baseUrl = `https://${companyName}.vagas.solides.com.br/vaga/`;
    const firstPageResponse = yield axios_1.default.get(`https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=1&slug=${companyName}`);
    const totalPages = firstPageResponse.data.data.totalPages;
    const allJobs = [];
    for (let page = 1; page <= totalPages; page++) {
        const response = yield axios_1.default.get(`https://apigw.solides.com.br/jobs/v3/home/vacancy?title=&locations=&take=8&page=${page}&slug=${companyName}`);
        allJobs.push(...response.data.data.data);
    }
    const jobUrls = allJobs.map(job => `${baseUrl}${job.id}`);
    return jobUrls;
});
exports.scraperJobSolides = scraperJobSolides;
