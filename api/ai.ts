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

    const contextSize = JSON.stringify(contextData).length;
    console.log('[api/ai] request', {
      messagesCount: messages.length,
      userTextLength: userText.length,
      contextSize
    });

    // Import dinâmico para evitar crash de boot da function
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento, Patrocínio e Infra-BR.
Responda EXCLUSIVAMENTE com base no contexto recebido.
Regras:
1) Não invente dados.
2) Se faltar dado no contexto, diga explicitamente.
3) Responda em português do Brasil com markdown claro.
4) Só gere bloco \`\`\`json-chart quando o usuário pedir gráfico explicitamente.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        {
          role: 'user',
          parts: [
            {
              text: `PERGUNTA:\n${userText}\n\nCONTEXTO:\n${JSON.stringify(contextData)}`
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.1
      }
    });

    const text = response.text || '';
    console.log('[api/ai] success', { responseLength: text.length });

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('[api/ai] erro detalhado', {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    });

    return res.status(500).json({
      error: 'Falha ao consultar IA',
      message: error?.message || 'Erro interno inesperado.'
    });
  }
}