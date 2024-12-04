import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface GupyUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface GupySitemap {
  urlset: {
    url: GupyUrl | GupyUrl[];
    lastBuildDate?: string;
  };
}

export const scraperJobGupy = async (url: string): Promise<string[]> => {
  const jobUrls: string[] = [];
  
  try {
    // Extrai o nome da empresa da URL
    const companyName = url.match(/https?:\/\/([^.]+)\.gupy\.io/)?.[1];
    
    if (!companyName) {
      throw new Error('Nome da empresa não encontrado na URL');
    }

    // Busca o sitemap da empresa
    const sitemapUrl = `https://${companyName}.gupy.io/sitemap.xml`;
    const response = await axios.get(sitemapUrl);
    
    // Parse do XML
    const parser = new XMLParser();
    const xmlData = parser.parse(response.data) as GupySitemap;
    
    // Extrai as URLs das vagas
    if (xmlData.urlset && xmlData.urlset.url) {
      const urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
        
      jobUrls.push(...urls.map((url: GupyUrl) => url.loc));
    }

    return jobUrls;
  } catch (error) {
    console.error(`Erro ao buscar vagas:`, error);
    throw error;
  }
};

// Exemplo de uso:
// const vagas = await scraperJobGupy('genteraizen');