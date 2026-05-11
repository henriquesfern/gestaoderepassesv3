import { GoogleGenAI } from '@google/genai';
import { EDITAIS_CONTEXT } from '../src/editais-context.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userText, contextData } = req.body;
    // Utilize VITE_GEMINI_API_KEY ou GEMINI_API_KEY, mas prefira GEMINI_API_KEY no backend para não expor a chave
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY; 
    
    if (!apiKey) {
      throw new Error("A chave da API do Gemini (GEMINI_API_KEY) não está configurada no ambiente do servidor.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const extraContextText = EDITAIS_CONTEXT;

    const systemInstruction = `Você é um assistente de IA integrado ao sistema de Fomento, Patrocínio e Infra-BR.
Sua função é gerar relatórios, responder perguntas e detalhar indicadores EXCLUSIVAMENTE com base nestes dados:
${JSON.stringify(contextData)}

DOCUMENTOS DE APOIO (Editais, Portarias, Leis e Decisões Normativas):
${extraContextText}

REGRAS ESTABELECIDAS:
1. RESPONDA APENAS SOBRE FOMENTO, PATROCÍNIO, NOTAS DO INFRA-BR, DIMENSÕES, COMPONENTES E INDICADORES FORNECIDOS NOS DADOS.
2. Recuse educadamente qualquer assunto fora deste escopo, citando regras de conduta.
3. Não emita opiniões pessoais ou invente dados. Caso seja questionado sobre algo que não está nos dados ou documentos, diga que as informações não estão no sistema.
4. Formate as respostas utilizando Markdown para criar relatórios estruturados, claros e cordiais.
5. NUNCA gere o bloco "json-chart" a menos que o usuário tenha pedido um gráfico EXPLICITAMENTE em sua mensagem (por exemplo, "gere um gráfico", "mostre em gráfico", etc). Ao invés disso, apresente os dados de forma textual e pergunte proativamente ao final da sua resposta se o usuário gostaria de visualizar essas informações em formato de gráfico (ex: "Gostaria de ver esse resultado em um gráfico interativo? Se sim, me confirme e informe qual métrica deseja comparar, como top 5 entidades por repasse").
6. APENAS quando um gráfico for explicitamente solicitado, você DEVE gerar o componente visual do gráfico utilizando EXATAMENTE um bloco de código markdown (iniciando com \`\`\`json-chart e terminando com \`\`\`) contendo um JSON com a configuração.
7. Para garantir gráficos eficazes e legíveis:
   - Limite a quantidade de itens no array \`data\` (preferencialmente os top 5 ou top 10 itens) para não poluir visualmente.
   - Mantenha os valores de \`name\` (eixo X) curtos e limpos (ex: use apenas a sigla do estado, ou o primeiro nome da entidade/título curto).
   - Tipos suportados: "bar", "line" ou "pie". Adapte o tipo conforme a melhor visualização para a comparação pedida.

FORMATO OBRIGATÓRIO do gráfico (use aspas duplas, NUNCA use comentários no JSON):
\`\`\`json-chart
{
  "type": "bar",
  "data": [
     { "name": "SP", "value": 150000 },
     { "name": "RJ", "value": 100000 }
  ],
  "xKey": "name",
  "yKey": "value",
  "color": "#4f46e5",
  "label": "Valor repassado"
}
\`\`\`
Lembre-se: por padrão, APENAS ofereça o gráfico no final do texto de forma ativa e sugestiva. Somente gere o bloco "json-chart" após o pedido explícito do usuário, respeitando as boas práticas de legibilidade (tamanho do \`data\` e \`name\`). Nunca deixe de envolver o JSON com as crases (\`\`\`).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
          ...messages.map((m: any) => ({
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

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Erro na API do Gemini:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido no servidor" });
  }
}
