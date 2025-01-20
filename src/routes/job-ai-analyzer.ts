import { Request, Response, NextFunction } from 'express';
import { ExpressHandler } from '../types';
import { handleJobDetailsRequest } from './unified-job-details';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('A variável de ambiente OPENAI_API_KEY é obrigatória');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface AIAnalyzedJob {
  titulo: string;
  area: string;
  senioridade: string;
  modelo_trabalho: string;
  modelo_contrato: string;
  localizacao: {
    cidade: string;
    estado: string;
    pais: string;
  };
  descricao: string;
  requisitos: string[];
  beneficios: string[];
}

export const jobAIAnalyzerHandler: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Primeiro, vamos obter os dados brutos da vaga usando o handler existente
    const jobData: any = await new Promise((resolve, reject) => {
      const mockRes = {
        json: resolve,
        status: function(code: number) {
          if (code !== 200) {
            reject(new Error(`Failed to fetch job data: ${code}`));
          }
          return this;
        }
      } as Response;

      // Criando um objeto Request compatível
      const mockReq = Object.create(req, {
        setTimeout: { value: () => {} },
        destroy: { value: () => {} },
        _read: { value: () => {} },
        read: { value: () => {} }
      });

      handleJobDetailsRequest(mockReq, mockRes as Response, next);
    });

    if (!jobData) {
      res.status(400).json({ error: 'Não foi possível obter os dados da vaga' });
      return;
    }

    // Preparar o prompt para a OpenAI
    const prompt = `Analise os seguintes dados de uma vaga de emprego e extraia APENAS as informações solicitadas em um formato estruturado:

${JSON.stringify(jobData, null, 2)}

Retorne APENAS as seguintes informações em formato JSON:
{
  "titulo": "título da vaga",
  "area": "área da vaga (ex: tecnologia, customer success, vendas, marketing, etc)",
  "senioridade": "nível de senioridade",
  "modelo_trabalho": "tipo de trabalho",
  "modelo_contrato": "tipo de contrato",
  "localizacao": {
    "cidade": "nome da cidade",
    "estado": "nome do estado",
    "pais": "nome do país"
  },
  "descricao": "descrição resumida da vaga",
  "requisitos": ["lista de requisitos principais"],
  "beneficios": ["lista de benefícios oferecidos"]
}

Observações importantes:
1. Para modelo_trabalho, use APENAS: "remoto", "híbrido" ou "presencial"
2. Para modelo_contrato, use APENAS: "CLT", "PJ" ou "estágio"
3. Para senioridade, padronize como: "júnior", "pleno", "sênior" ou "não especificado"
4. Para área, use uma das seguintes opções: "tecnologia", "customer success", "vendas", "marketing", "recursos humanos", "financeiro", "administrativo", "operações", "produto", "design", "dados", "jurídico" ou "outros"
5. Se alguma informação não estiver disponível, use "não especificado" para campos de texto, {} para objetos vazios, ou [] para arrays
6. Para localização, se algum componente não estiver especificado, use "não especificado"
7. Mantenha a descrição objetiva e concisa, com no máximo 2 frases
8. Remova qualquer menção a salário ou faixa salarial da descrição
9. Ordene os requisitos e benefícios por ordem de importância
10. Remova requisitos ou benefícios duplicados ou muito similares`;

    // Fazer a chamada para a OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em análise de vagas de emprego. Extraia APENAS as informações solicitadas e estruture-as exatamente no formato JSON especificado, seguindo todas as regras de padronização."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }
    });

    const aiAnalysis = JSON.parse(completion.choices[0].message.content || '{}');

    res.json(aiAnalysis);
  } catch (error) {
    console.error('Erro ao analisar vaga com IA:', error);
    res.status(500).json({ error: 'Erro ao analisar vaga com IA' });
  }
}; 