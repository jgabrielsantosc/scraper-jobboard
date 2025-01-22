import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface CompleoUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface CompleoSitemap {
  urlset: {
    url: CompleoUrl | CompleoUrl[];
  };
}

export const scraperJobCompleo = async (url: string): Promise<string[]> => {
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.compleo\.com\.br/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Constrói a URL do sitemap
    const sitemapUrl = `https://${companyName}.compleo.com.br/sitemap.xml`;
    
    // Busca o sitemap
    const response = await axios.get(sitemapUrl);
    
    // Parse do XML
    const parser = new XMLParser();
    const xmlData = parser.parse(response.data) as CompleoSitemap;
    
    // Extrai as URLs das vagas
    if (xmlData.urlset && xmlData.urlset.url) {
      const urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
        
      return urls.map(url => url.loc);
    }

    return [];
  } catch (error) {
    console.error(`Erro ao buscar vagas da Compleo:`, error);
    throw error;
  }
}; 