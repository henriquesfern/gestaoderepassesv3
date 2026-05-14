import { GoogleGenAI } from '@google/genai';
import { EDITAIS_CONTEXT } from '../../api/_lib/editais-context.ts';

export async function askGemini(messages: any[], userText: string, contextData: any) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return [
      '### IA indisponível no momento',
      '',
      'A integração com IA está desativada porque a variável `GEMINI_API_KEY` não foi configurada.',
      '',
      'Você ainda pode usar normalmente todos os painéis do dashboard (Visão Geral, Diretórios, Insights e Infra-BR).',
      '',
      'Se quiser, posso te orientar a configurar a chave no ambiente para habilitar a IA.',
    ].join('\n');
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
5. NUNCA gere o bloco "json-chart" a menos que o usuário tenha pedido um gráfico EXPLICITAMENTE em sua mensagem.
6. APENAS quando um gráfico for explicitamente solicitado, você DEVE gerar o componente visual do gráfico utilizando EXATAMENTE um bloco markdown com o JSON da configuração.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...messages.map((message: any) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
      { role: 'user', parts: [{ text: userText }] },
    ],
    config: {
      systemInstruction,
      temperature: 0.1,
    },
  });

  return response.text;
}
