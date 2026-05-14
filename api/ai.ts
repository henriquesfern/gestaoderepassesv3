import { EDITAIS_CONTEXT } from './_lib/editais-context';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  userText?: string;
  contextData?: Record<string, unknown>;
};

function isChartRequest(text: string): boolean {
  const normalized = (text || '').toLowerCase();
  const keywords = [
    'gráfico',
    'grafico',
    'chart',
    'plot',
    'pizza',
    'barras',
    'barra',
    'linha',
    'pie',
    'line chart',
    'bar chart',
    'json-chart',
    'json chart',
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
}

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'IA indisponível',
        message: 'A variável GEMINI_API_KEY não está configurada no ambiente do servidor.',
      });
    }

    const body = (req.body || {}) as RequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const userText = typeof body.userText === 'string' ? body.userText.trim() : '';
    const contextData = body.contextData ?? {};

    if (!userText) {
      return res.status(400).json({
        error: 'Requisição inválida',
        message: 'O campo userText é obrigatório.',
      });
    }

    if (isChartRequest(userText)) {
      return res.status(200).json({
        text:
          '### Geração de gráficos temporariamente indisponível\n\n' +
          'No momento, a solução ainda não está preparada para a geração de gráficos na consulta de IA e está em processo de aprendizado para isso.\n\n' +
          'Se quiser, posso continuar com a análise em formato textual (ranking, comparativos e resumos).',
      });
    }

    const serverContext = {
      ...contextData,
      normativos_contexto: String(EDITAIS_CONTEXT || '').slice(0, 16000),
    };

    console.log('[api/ai] request', {
      messagesCount: messages.length,
      userTextLength: userText.length,
      contextSize: JSON.stringify(contextData).length,
      serverContextSize: JSON.stringify(serverContext).length,
    });

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Você é um assistente de IA do dashboard de Fomento, Patrocínio, Infra-BR e Normativos.

REGRAS:
1) Responda APENAS com base no contexto recebido.
2) Não invente dados.
3) Se faltar dado, diga explicitamente.
4) Responda em português do Brasil, em markdown claro.
5) NÃO gerar gráficos.
6) NÃO gerar blocos json-chart, chart, plot ou similares.
7) Se o usuário pedir gráfico, informe que a solução ainda não está preparada para geração de gráficos e está em processo de aprendizado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...messages.map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: `PERGUNTA DO USUÁRIO:\n${userText}\n\nCONTEXTO DE DADOS:\n${JSON.stringify(serverContext)}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const text = response.text || '';
    console.log('[api/ai] success', { responseLength: text.length });

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('[api/ai] erro detalhado', {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });

    return res.status(500).json({
      error: 'Falha ao consultar IA',
      message: error?.message || 'Erro interno inesperado.',
    });
  }
}
