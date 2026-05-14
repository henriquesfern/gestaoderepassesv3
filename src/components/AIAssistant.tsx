import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Send, Sparkles, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useData } from '../context/DataContext';
import { infraData } from '../data/infraBR_parser';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

function normalizeModelMessage(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\bR\s*\$\s*(?=\d)/g, 'R$ ')
    .replace(/\bR\s+(?=\d)/g, 'R$ ')
    .replace(/(\d)\s*\.\s*(\d)/g, '$1.$2')
    .replace(/(\d)\s*,\s*(\d{2})(?!\d)/g, '$1,$2')
    .replace(/(?<=\b[\p{L}])\s*\n\s*(?=[\p{L}]\b)/gu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function AIAssistant() {
  const { appData } = useData();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        return parsed.map((message) => (
          message.role === 'model'
            ? { ...message, text: normalizeModelMessage(message.text) }
            : message
        ));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('ai_chat_history');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const topFomento2026 = [...appData.fomento2026]
        .sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE)
        .slice(0, 120);
      const topFomento2025 = [...appData.fomentoHistorico]
        .sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE)
        .slice(0, 120);
      const topPatrocinio2025 = [...appData.patrocinioHistorico]
        .sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE)
        .slice(0, 120);

      const contextData = {
        resumo: {
          totalFomento2026: appData.fomento2026.length,
          totalFomento2025: appData.fomentoHistorico.length,
          totalPatrocinio2025: appData.patrocinioHistorico.length
        },
        fomento2026_top: topFomento2026.map((d) => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Objetivo: d.OBJETIVO,
          RankingInfraBR: d.RANKING_ADERENCIA_INFRABR
        })),
        fomento2025_top: topFomento2025.map((d) => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Objetivo: d.OBJETIVO
        })),
        patrocinio2025_top: topPatrocinio2025.map((d) => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Projeto: d.OBJETIVO
        })),
        infraBR_estados: infraData.infraEstados.slice(0, 27).map((d) => ({
          UF: d.sigla_uf,
          Nota: d.infra_br,
          Rank: d.rank
        }))
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userText, contextData })
      });

      const rawText = await response.text();

      let payload: any = null;
      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const backendMsg = payload?.message || payload?.error;
        throw new Error(backendMsg || `Falha HTTP ${response.status} ao consultar IA.`);
      }

      const text = normalizeModelMessage(payload?.text || 'Sem resposta da IA.');
      setMessages((prev) => [...prev, { role: 'model', text }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: normalizeModelMessage(
            `**Erro ao consultar a base de dados via IA:** ${error?.message || 'IA indisponível no momento.'}`
          )
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-slate-50"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Assistente de IA</h2>
            <p className="text-sm text-slate-500">
              Consulta textual institucional sobre fomento, patrocínio, Infra-BR e normativos
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            title="Limpar histórico"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Limpar histórico</span>
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-start gap-3 border-b border-indigo-100 bg-indigo-50 p-4">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-indigo-600" />
        <p className="text-sm leading-relaxed text-indigo-800">
          <strong>Aviso:</strong> Este canal prioriza formatação textual simples e institucional para melhor legibilidade.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center opacity-60">
            <Bot size={64} className="mb-4 text-slate-400" />
            <h3 className="mb-2 text-lg font-medium text-slate-700">Como posso ajudar?</h3>
            <p className="text-sm text-slate-500">
              Faça perguntas sobre fomento, patrocínio, Infra-BR e normativos. As respostas serão apresentadas em texto institucional.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Bot size={18} className="text-indigo-600" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'rounded-br-none bg-[#003865] text-white'
                  : 'rounded-bl-none border border-slate-200 bg-white text-slate-700 shadow-sm'
              }`}
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                letterSpacing: 'normal',
                wordBreak: 'normal',
                overflowWrap: 'break-word'
              }}
            >
              {msg.role === 'user' ? (
                <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="max-w-none text-slate-700">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml={true}
                    components={{
                      p: ({ children }) => <p className="my-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
                      ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
                      li: ({ children }) => <li className="my-1">{children}</li>,
                      h1: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      h2: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      h3: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      h4: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      h5: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      h6: ({ children }) => <p className="my-2 font-semibold">{children}</p>,
                      blockquote: ({ children }) => <p className="my-2">{children}</p>,
                      code: ({ children }) => <span>{children}</span>,
                      pre: ({ children }) => <div>{children}</div>,
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline underline-offset-2"
                        >
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="my-3 border-slate-200" />
                    }}
                  >
                    {msg.text}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <Bot size={18} className="text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="relative mx-auto flex max-w-4xl gap-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Pergunte sobre fomento, patrocínio, Infra-BR e normativos..."
            className="h-14 flex-1 resize-none rounded-xl border-transparent bg-slate-100 px-4 py-4 pr-14 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute bottom-2 right-2 top-2 aspect-square flex items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-slate-400">Inteligência Artificial por Gemini - Flash Model</span>
        </div>
      </div>
    </div>
  );
}
