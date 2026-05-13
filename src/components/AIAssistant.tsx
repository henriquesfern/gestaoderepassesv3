import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Markdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { useData } from '../context/DataContext';
import { infraData } from '../data/infraBR_parser';
import { EDITAIS_CONTEXT } from '../editais-context';

export function AIAssistant() {
  const { appData } = useData();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    const saved = sessionStorage.getItem('ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('ai_chat_history');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const topFomento2026 = [...appData.fomento2026].sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE).slice(0, 120);
      const topFomento2025 = [...appData.fomentoHistorico].sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE).slice(0, 120);
      const topPatrocinio2025 = [...appData.patrocinioHistorico].sort((a, b) => b.VALOR_REPASSE - a.VALOR_REPASSE).slice(0, 120);

      const contextData = {
        resumo: {
          totalFomento2026: appData.fomento2026.length,
          totalFomento2025: appData.fomentoHistorico.length,
          totalPatrocinio2025: appData.patrocinioHistorico.length
        },
        fomento2026_top: topFomento2026.map(d => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Objetivo: d.OBJETIVO,
          RankingInfraBR: d.RANKING_ADERENCIA_INFRABR
        })),
        fomento2025_top: topFomento2025.map(d => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Objetivo: d.OBJETIVO
        })),
        patrocinio2025_top: topPatrocinio2025.map(d => ({
          Entidade: d.ENTIDADE,
          UF: d.ESTADO,
          Repasse: d.VALOR_REPASSE,
          Projeto: d.OBJETIVO
        })),
        infraBR_estados: infraData.infraEstados.slice(0, 27).map(d => ({
          UF: d.sigla_uf,
          Nota: d.infra_br,
          Rank: d.rank
        })),
        normativos_contexto: String(EDITAIS_CONTEXT || '').slice(0, 16000)
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

      const text = payload?.text || 'Sem resposta da IA.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: `**Erro ao consultar a base de dados via IA:** ${error?.message || 'IA indisponível no momento.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-50 relative overflow-hidden"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Assistente de IA</h2>
            <p className="text-sm text-slate-500">
              Consulta inteligente aos dados de fomento, patrocínio, Infra-BR e normativos (sem geração de gráficos)
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="Limpar Histórico"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Limpar Histórico</span>
          </button>
        )}
      </div>

      <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-start gap-3">
        <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800 leading-relaxed">
          <strong>Aviso:</strong> A solução ainda não está preparada para geração de gráficos na consulta de IA e está em processo de aprendizado para isso.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-60">
            <Bot size={64} className="text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Como posso ajudar?</h3>
            <p className="text-slate-500 text-sm">
              Você pode pedir relatórios e comparações em formato textual sobre fomento, patrocínio, Infra-BR e normativos.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-indigo-600" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-[#003865] text-white rounded-br-none'
                  : 'bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-700'
              }`}
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                letterSpacing: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap m-0">{msg.text}</p>
              ) : (
                <div className="max-w-none text-slate-700">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    skipHtml={true}
                    components={{
                      // Estrutura básica e segura
                      h1: ({ children }) => <h1 className="text-lg font-semibold mt-2 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mt-2 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                      p: ({ children }) => <p className="my-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
                      li: ({ children }) => <li className="my-1">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-slate-300 pl-3 my-2 text-slate-600">{children}</blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[13px]">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-100 text-slate-700 p-3 rounded-lg overflow-auto text-[13px] my-2">{children}</pre>
                      ),
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
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 relative">
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
            className="flex-1 resize-none h-14 bg-slate-100 border-transparent rounded-xl px-4 py-4 pr-14 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400">Inteligência Artificial por Gemini - Flash Model</span>
        </div>
      </div>
    </div>
  );
}