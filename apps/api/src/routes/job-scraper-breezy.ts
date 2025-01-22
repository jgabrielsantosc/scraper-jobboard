import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface BreezyUrl {
  loc: string;
  lastmod?: string;
}

interface BreezySitemap {
  urlset: {
    url: BreezyUrl | BreezyUrl[];
  };
}

export const scraperJobBreezy = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.breezy\.hr/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca o sitemap
    const sitemapUrl = `https://${companyName}.breezy.hr/sitemap.xml`;
    const response = await axios.get(sitemapUrl);
    
    // Parse do XML
    const parser = new XMLParser();
    const xmlData = parser.parse(response.data) as BreezySitemap;
    
    // Extrai as URLs das vagas
    if (xmlData.urlset && xmlData.urlset.url) {
      const urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
        
      // Filtra apenas URLs de vagas (geralmente contém '/p/')
      return urls
        .map(url => url.loc)
        .filter(url => url.includes('/p/'));
    }

    return [];
  } catch (error) {
    console.error(`Erro ao buscar vagas do Breezy:`, error);
    throw error;
  }
}; 