import fs from 'fs';
import path from 'path';
import { scraperJobInhire } from '../src/routes/job-scraper-inhire';

const jobboardPath = path.join(__dirname, 'inhire-jobboard.json');
const urlsOutputPath = path.join(__dirname, 'inhire-jobs-urls.json');
const resultsOutputPath = path.join(__dirname, 'inhire-jobs-results.json');

async function runInhireTests() {
  try {
    // Lê o arquivo de jobboards
    const jobboards = JSON.parse(fs.readFileSync(jobboardPath, 'utf-8'));
    
    // Array para armazenar todas as URLs extraídas
    const allJobUrls: string[] = [];
    
    // Extrai URLs de cada jobboard
    for (const jobboard of jobboards) {
      try {
        console.log(`Extraindo vagas de: ${jobboard.url}`);
        const urls = await scraperJobInhire(jobboard.url);
        allJobUrls.push(...urls);
        
      } catch (error) {
        console.error(`Erro ao extrair vagas de ${jobboard.url}:`, error);
      }
    }
    
    // Remove duplicatas
    const uniqueJobUrls = [...new Set(allJobUrls)];
    
    // Salva as URLs em um arquivo
    fs.writeFileSync(urlsOutputPath, JSON.stringify(uniqueJobUrls, null, 2));
    console.log(`URLs salvas em: ${urlsOutputPath}`);
    
    return uniqueJobUrls;
    
  } catch (error) {
    console.error('Erro ao executar testes:', error);
    throw error;
  }
}

// Executa os testes
runInhireTests().catch(console.error); 