import { GoogleGenAI } from '@google/genai';
import { EDITAIS_CONTEXT } from '../src/editais-context';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  userText?: string;
  contextData?: any;
};

export default async function handler(req: any, res: any) {
  try {
    // CORS básico
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Método não permitido. Use POST.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'IA indisponível',
        message: 'A variável GEMINI_API_KEY não está configurada no ambiente do servidor.'
      });
    }

    const body = (req.body || {}) as RequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const userText = typeof body.userText === 'string' ? body.userText.trim() : '';
    const contextData = body.contextData ?? {};

    if (!userText) {
      return res.status(400).json({
        error: 'Requisição inválida',
        message: 'O campo userText é obrigatório.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento, Patrocínio e Infra-BR.
Sua função é gerar relatórios, responder perguntas e detalhar indicadores EXCLUSIVAMENTE com base nestes dados:
${JSON.stringify(contextData)}

DOCUMENTOS DE APOIO (Editais, Portarias, Leis e Decisões Normativas):
${EDITAIS_CONTEXT}

REGRAS ESTABELECIDAS:
1. RESPONDA APENAS SOBRE FOMENTO, PATROCÍNIO, NOTAS DO INFRA-BR, DIMENSÕES, COMPONENTES E INDICADORES FORNECIDOS NOS DADOS.
2. Recuse educadamente qualquer assunto fora deste escopo, citando regras de conduta.
3. Não emita opiniões pessoais ou invente dados. Caso seja questionado sobre algo que não está nos dados ou documentos, diga que as informações não estão no sistema.
4. Formate as respostas utilizando Markdown para criar relatórios estruturados, claros e cordiais.
5. NUNCA gere o bloco "json-chart" a menos que o usuário tenha pedido um gráfico EXPLICITAMENTE em sua mensagem (por exemplo, "gere um gráfico", "mostre em gráfico", etc). Ao invés disso, apresente os dados de forma textual e pergunte proativamente ao final da sua resposta se o usuário gostaria de visualizar essas informações em formato de gráfico.
6. APENAS quando um gráfico for explicitamente solicitado, você DEVE gerar o componente visual do gráfico utilizando EXATAMENTE um bloco de código markdown (iniciando com \`\`\`json-chart e terminando com \`\`\`) contendo um JSON com a configuração.
7. Para garantir gráficos eficazes e legíveis:
   - Limite a quantidade de itens no array \`data\` (preferencialmente os top 5 ou top 10 itens).
   - Mantenha os valores de \`name\` curtos e limpos.
   - Tipos suportados: "bar", "line" ou "pie".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userText }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.1
      }
    });

    return res.status(200).json({
      text: response.text || ''
    });
  } catch (error: any) {
    console.error('[api/ai] Erro:', error);

    return res.status(500).json({
      error: 'Falha ao consultar IA',
      message: error?.message || 'Erro interno inesperado.'
    });
  }
}