# 🎯 Job Scraper API

Uma API para coletar vagas de emprego de diferentes job boards de forma automatizada.

## 📋 Sobre o Projeto

Este projeto é um web scraper feito coletar vagas de emprego de diferentes plataformas de recrutamento, centralizando todas as informações em uma única API. Atualmente, suportamos as seguintes plataformas:

### Portais Suportados

- ✅ Gupy
- ✅ Lever
- ✅ Greenhouse
- ✅ Workable
- ✅ BambooHR
- ✅ Breezy
- ✅ iCIMS
- ✅ Recruitee
- ✅ Factorial
- ✅ Abler
- ✅ Compleo
- ✅ Enlizt
- ✅ Gupy
- ✅ HiringRoom
- ✅ Inhire
- ✅ PandaP
- ✅ Quickin
- ✅ Recrut.ai
- ✅ Recrutei

## 🚀 Funcionalidades

- Crawler para coletar as URLs das vagas disponíveis em um jobboard
- Scraping para retornar as informações de uma vaga específica a partir da URL.
- Agente de AI para tratar os dados coletados e retornar em um JSON com informações padronizadas.
- API RESTful documentada com Swagger

## 🛠️ Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Playwright (para web scraping)
- Swagger UI (documentação da API)
- Docker

## 🚀 Deploy


### Variáveis de Ambiente
Crie um arquivo `.env` com:

```env
FIRECRAWL_API_KEY=sua_chave_api
FIRECRAWL_API_URL=url_da_api
GUPY_BUILD_ID=id_scraper_gupy
```

## 📚 Documentação da API

A documentação completa está disponível via Swagger UI em:
```
http://localhost:3001/api-docs
```

### Endpoints Principais

- `GET /scraper-job` - Lista todas as vagas disponíveis
- `GET /job-details` - Retorna as informações das vagas de qualquer plataforma (ex: gupy, workable, lever)

---

Desenvolvido com ❤️ por [João Santos](https://github.com/joaogsantosc)
```