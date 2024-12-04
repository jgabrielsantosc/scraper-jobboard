import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface InhireJobDetails {
  tenantName: string;
  description: string;
  displayName: string;
  workplaceType: string;
  location: string;
  about: string;
  contractType: string[];
}

const urlsPath = path.join(__dirname, 'inhire-jobs-urls.json');
const resultsPath = path.join(__dirname, 'inhire-jobs-results.json');

async function extractJobDetails(url: string): Promise<InhireJobDetails | null> {
  try {
    // Extrai tenant e jobId da URL
    const urlMatch = url.match(/https?:\/\/([^.]+)\.inhire\.app\/vagas\/([^/]+)/);
    if (!urlMatch) {
      throw new Error('URL inválida: ' + url);
    }

    const [, tenant, jobId] = urlMatch;

    // Faz a requisição para a API
    const response = await axios.get<InhireJobDetails>(
      `https://api.inhire.app/job-posts/public/pages/${jobId}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Tenant': tenant
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error(`Erro ao extrair detalhes da vaga ${url}:`, error);
    return null;
  }
}

async function runJobDetailsTests() {
  try {
    // Lê as URLs das vagas
    const jobUrls = JSON.parse(fs.readFileSync(urlsPath, 'utf-8'));
    
    // Array para armazenar os resultados
    const results: InhireJobDetails[] = [];
    
    // Processa cada URL
    for (const url of jobUrls) {
      console.log(`Extraindo detalhes de: ${url}`);
      const jobDetails = await extractJobDetails(url);
      
      if (jobDetails) {
        results.push(jobDetails);
      }
      
      // Aguarda um pouco para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Salva os resultados
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Resultados salvos em: ${resultsPath}`);
    
    return results;
    
  } catch (error) {
    console.error('Erro ao executar testes de detalhes:', error);
    throw error;
  }
}

// Executa os testes
runJobDetailsTests().catch(console.error); 