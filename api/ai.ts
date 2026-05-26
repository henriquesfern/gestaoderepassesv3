import { NORMATIVOS_INDEX } from './_lib/normativos-index.js';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  userText?: string;
  contextData?: Record<string, unknown>;
};

type NormativoChunk = {
  id: string;
  ordem: number;
  texto: string;
  palavras_chave?: string[];
};

type NormativoDocument = {
  id: string;
  arquivo: string;
  tipo: string;
  ano: number | null;
  titulo: string;
  resumo: string;
  resumo_extraido?: string;
  prioridade: number;
  palavras_chave?: string[];
  chunks: NormativoChunk[];
};

const CONTEXTO_NORMATIVO_MAX_CHARS = 28000;

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

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tokenizeSearchText(value: string) {
  const stopWords = new Set([
    'para',
    'pela',
    'pelo',
    'como',
    'com',
    'dos',
    'das',
    'que',
    'uma',
    'por',
    'sobre',
    'qual',
    'quais',
    'onde',
    'quando',
    'fale',
    'explique',
    'confea',
    'crea',
    'sistema',
  ]);

  return (normalizeSearchText(value).match(/[a-z0-9]{4,}/g) || [])
    .filter((token) => !stopWords.has(token));
}

function countTokenMatches(searchable: string, questionTokens: string[], weight: number) {
  return questionTokens.reduce((total, token) => {
    return searchable.includes(token) ? total + weight : total;
  }, 0);
}

function scoreDocument(document: NormativoDocument, normalizedQuestion: string, questionTokens: string[]) {
  const normalizedTitle = normalizeSearchText(document.titulo);
  const normalizedFileName = normalizeSearchText(document.arquivo);
  const searchable = normalizeSearchText([
    document.arquivo,
    document.tipo,
    document.ano,
    document.titulo,
    document.resumo,
    ...(document.palavras_chave || []),
  ].join(' '));

  let score = document.prioridade || 0;

  score += countTokenMatches(`${normalizedTitle} ${normalizedFileName}`, questionTokens, 35);
  score += countTokenMatches(searchable, questionTokens, 8);

  if (document.ano && normalizedQuestion.includes(String(document.ano))) score += 120;
  if (document.tipo === 'fomento' && normalizedQuestion.includes('fomento')) score += 120;
  if (document.tipo === 'patrocinio' && normalizedQuestion.includes('patrocinio')) score += 120;
  if (document.tipo === 'lei' && (normalizedQuestion.includes('lei') || normalizedQuestion.includes('14133'))) score += 80;
  if (document.tipo === 'portaria' && normalizedQuestion.includes('portaria')) score += 80;
  if (document.tipo === 'decisao_normativa' && (normalizedQuestion.includes('decisao') || normalizedQuestion.includes('normativa'))) score += 90;
  if (document.titulo.toLowerCase().includes('errata') && normalizedQuestion.includes('errata')) score += 100;
  if (normalizedQuestion.includes('edital') && normalizedTitle.includes('edital')) score += 60;
  if (normalizedQuestion.includes('122') && (normalizedTitle.includes('122') || normalizedFileName.includes('122'))) score += 180;
  if (normalizedQuestion.includes('14133') && (normalizedTitle.includes('14133') || normalizedFileName.includes('14133'))) score += 180;
  if (document.tipo === 'portaria' && /\bportaria\s+\d+/i.test(normalizedQuestion)) {
    const requestedPortaria = normalizedQuestion.match(/portaria\s+(\d+)/)?.[1];
    if (requestedPortaria && (normalizedTitle.includes(requestedPortaria) || normalizedFileName.includes(requestedPortaria))) score += 160;
  }

  return score;
}

function scoreChunk(chunk: NormativoChunk, questionTokens: string[], documentScore: number) {
  const searchable = normalizeSearchText([
    chunk.texto.slice(0, 600),
    ...(chunk.palavras_chave || []),
  ].join(' '));

  let score = documentScore * 0.25;

  for (const token of questionTokens) {
    if (searchable.includes(token)) score += 20;
  }

  if (chunk.ordem <= 2) score += 10;
  return score;
}

function buildNormativosContext(userText: string) {
  const normalizedQuestion = normalizeSearchText(userText);
  const questionTokens = tokenizeSearchText(userText);
  const documents = (NORMATIVOS_INDEX as NormativoDocument[])
    .map((document) => ({
      document,
      score: scoreDocument(document, normalizedQuestion, questionTokens),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const selectedParts: string[] = [
    'ÍNDICE NORMATIVO RECUPERADO PARA A PERGUNTA',
    'Use somente os trechos abaixo para responder sobre editais, portarias, leis e decisões normativas. Cite o documento e o ano quando possível.',
  ];

  let usedChars = selectedParts.join('\n').length;

  for (const { document, score } of documents) {
    const header = [
      '',
      `### ${document.titulo}`,
      `Arquivo: ${document.arquivo}`,
      `Tipo: ${document.tipo}`,
      `Ano: ${document.ano ?? 'não identificado'}`,
      `Resumo curado: ${document.resumo}`,
      document.resumo_extraido ? `Resumo extraído: ${document.resumo_extraido}` : '',
    ].filter(Boolean).join('\n');

    if (usedChars + header.length > CONTEXTO_NORMATIVO_MAX_CHARS) break;
    selectedParts.push(header);
    usedChars += header.length;

    const selectedChunks = document.chunks
      .map((chunk) => ({ chunk, score: scoreChunk(chunk, questionTokens, score) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    for (const { chunk } of selectedChunks) {
      const chunkText = [
        '',
        `Trecho ${chunk.ordem}:`,
        chunk.texto.slice(0, 2600),
      ].join('\n');

      if (usedChars + chunkText.length > CONTEXTO_NORMATIVO_MAX_CHARS) break;
      selectedParts.push(chunkText);
      usedChars += chunkText.length;
    }
  }

  return selectedParts.join('\n');
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

    const perguntaInfraBR = contextData.dominio_preferencial === 'infra_br';
    const serverContext = perguntaInfraBR
      ? contextData
      : {
        ...contextData,
        normativos_contexto: buildNormativosContext(userText),
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
