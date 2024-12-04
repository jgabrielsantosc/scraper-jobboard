import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface EnliztUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface EnliztSitemap {
  urlset: {
    url: EnliztUrl | EnliztUrl[];
  };
}

export const scraperJobEnlizt = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.enlizt\.me/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca o sitemap
    const sitemapUrl = `https://${companyName}.enlizt.me/sitemap.xml`;
    const response = await axios.get(sitemapUrl);
    
    // Parse do XML
    const parser = new XMLParser();
    const xmlData = parser.parse(response.data) as EnliztSitemap;
    
    // Extrai as URLs das vagas
    if (xmlData.urlset && xmlData.urlset.url) {
      const urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
        
      // Filtra apenas URLs de vagas (contém '/vagas/')
      return urls
        .map(url => url.loc)
        .filter(url => url.includes('/vagas/'))
        .map(url => url.replace('http://', 'https://')); // Garante HTTPS
    }

    return [];
  } catch (error) {
    console.error(`Erro ao buscar vagas do Enlizt:`, error);
    throw error;
  }
}; 