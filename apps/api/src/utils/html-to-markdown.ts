import TurndownService from 'turndown';

export function cleanHtml(html: string): string {
  // Remove atributos desnecessários e classes
  return html
    .replace(/\s(class|style|data-[a-zA-Z-]+)="[^"]*"/g, '')
    .replace(/\s(id|data-qa|data-stringify-[a-zA-Z-]+)="[^"]*"/g, '')
    // Remove divs vazias e espaços extras
    .replace(/<div>\s*<\/div>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    // Remove estruturas específicas do Greenhouse
    .replace(/<div class="content-intro">/g, '')
    .replace(/<div class="content-conclusion">/g, '')
    // Remove tags sem conteúdo
    .replace(/<[^>]*>\s*<\/[^>]*>/g, '')
    // Remove comentários HTML
    .replace(/<!--[\s\S]*?-->/g, '');
}

export function convertHtmlToMarkdown(html: string): string {
  // Primeiro limpa o HTML
  const cleanedHtml = cleanHtml(html);

  // Configura o TurndownService
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    strongDelimiter: '**'
  });

  // Customiza algumas regras
  turndownService.addRule('removeEmptyParagraphs', {
    filter: function(node: HTMLElement): boolean {
      return (
        node.nodeName === 'P' &&
        (!node.textContent || node.textContent.trim().length === 0)
      );
    },
    replacement: () => ''
  });

  // Adiciona regra para limpar atributos de estilo
  turndownService.addRule('cleanStyles', {
    filter: ['span', 'div', 'p'],
    replacement: function(content: string): string {
      return content.trim() ? content + '\n\n' : '';
    }
  });

  // Melhora a formatação de listas
  turndownService.addRule('listFormatting', {
    filter: ['ul', 'ol'],
    replacement: function(content: string, node: Node): string {
      const prevSibling = node.previousSibling;
      const isPrevText = prevSibling && prevSibling.nodeType === Node.TEXT_NODE;
      return isPrevText ? '\n' + content + '\n' : content + '\n';
    }
  });

  // Converte para markdown
  let markdown = turndownService.turndown(cleanedHtml);

  // Limpeza pós-conversão
  markdown = markdown
    // Remove linhas em branco múltiplas
    .replace(/\n{3,}/g, '\n\n')
    // Remove espaços em branco no final das linhas
    .replace(/[ \t]+$/gm, '')
    // Padroniza listas
    .replace(/^\s*[•*-]\s*/gm, '- ')
    // Adiciona espaço após headers
    .replace(/^(#{1,6}.*)\n([^\n])/gm, '$1\n\n$2')
    // Remove linhas que só contêm espaços
    .replace(/^\s+$/gm, '')
    // Normaliza quebras de linha
    .replace(/\r\n/g, '\n')
    // Remove espaços extras antes e depois de texto em negrito/itálico
    .replace(/\s+\*\*/g, ' **')
    .replace(/\*\*\s+/g, '** ')
    .replace(/\s+_/g, ' _')
    .replace(/_\s+/g, '_ ')
    // Melhora formatação de títulos
    .replace(/^#{1,6}\s*$/gm, '')
    // Remove linhas vazias consecutivas no início e fim
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');

  return markdown.trim();
} 