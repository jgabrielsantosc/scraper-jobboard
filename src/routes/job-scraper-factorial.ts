import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface FactorialUrl {
  loc: string;
  lastmod?: string;
}

interface FactorialSitemap {
  urlset: {
    url: FactorialUrl | FactorialUrl[];
  };
}

export const scraperJobFactorial = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.factorialhr\.com\.br/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca o sitemap
    const sitemapUrl = `https://${companyName}.factorialhr.com.br/sitemap.xml`;
    const response = await axios.get(sitemapUrl);
    
    // Parse do XML
    const parser = new XMLParser();
    const xmlData = parser.parse(response.data) as FactorialSitemap;
    
    // Extrai as URLs das vagas
    if (xmlData.urlset && xmlData.urlset.url) {
      const urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
        
      // Filtra apenas URLs de vagas (contém '/job_posting/')
      return urls
        .map(url => url.loc)
        .filter(url => url.includes('/job_posting/'));
    }

    return [];
  } catch (error) {
    console.error(`Erro ao buscar vagas do Factorial:`, error);
    throw error;
  }
}; 