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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function safeArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function safeString(value: any, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeChartConfig(raw: any) {
  const config = raw && typeof raw === 'object' ? raw : {};
  const type = safeString(config.type, 'bar').toLowerCase();

  let data: any[] = [];

  // 1) Formato direto esperado
  data = safeArray(config.data);

  // 2) Alternativas comuns
  if (!data.length) data = safeArray(config.items);
  if (!data.length) data = safeArray(config.values);

  // 3) dataset.data
  if (!data.length && config.dataset && typeof config.dataset === 'object') {
    data = safeArray(config.dataset.data);
  }

  // 4) labels + series (array simples)
  if (!data.length && safeArray(config.labels).length && safeArray(config.series).length) {
    const labels = safeArray(config.labels);
    const series = safeArray(config.series);
    data = labels.map((label: any, i: number) => ({
      name: String(label ?? `Item ${i + 1}`),
      value: Number(series[i] ?? 0)
    }));
  }

  // 5) labels + series em objeto { "2025":[...], "2026":[...] } -> pega a primeira série
  if (!data.length && safeArray(config.labels).length && config.series && typeof config.series === 'object' && !Array.isArray(config.series)) {
    const labels = safeArray(config.labels);
    const seriesKeys = Object.keys(config.series);
    const firstKey = seriesKeys[0];
    const arr = safeArray(config.series[firstKey]);
    data = labels.map((label: any, i: number) => ({
      name: String(label ?? `Item ${i + 1}`),
      value: Number(arr[i] ?? 0)
    }));
  }

  // 6) labels + datasets (padrão Chart.js)
  if (!data.length && safeArray(config.labels).length && safeArray(config.datasets).length) {
    const labels = safeArray(config.labels);
    const firstDs = config.datasets[0] || {};
    const dsData = safeArray(firstDs.data);
    data = labels.map((label: any, i: number) => ({
      name: String(label ?? `Item ${i + 1}`),
      value: Number(dsData[i] ?? 0)
    }));
  }

  // 7) data no formato Chart.js: { labels:[], datasets:[...] }
  if (!data.length && config.data && typeof config.data === 'object') {
    const labels = safeArray(config.data.labels);
    const datasets = safeArray(config.data.datasets);
    if (labels.length && datasets.length) {
      const firstDs = datasets[0] || {};
      const dsData = safeArray(firstDs.data);
      data = labels.map((label: any, i: number) => ({
        name: String(label ?? `Item ${i + 1}`),
        value: Number(dsData[i] ?? 0)
      }));
    }
  }

  const sample = data[0] || {};

  const xKeyCandidates = [
    config.xKey,
    config.x_key,
    config.labelKey,
    config.categoryKey,
    'name',
    'label',
    'categoria',
    'item',
    'entidade',
    'x'
  ].filter(Boolean) as string[];

  const yKeyCandidates = [
    config.yKey,
    config.y_key,
    config.valueKey,
    config.metricKey,
    'value',
    'valor',
    'total',
    'quantidade',
    'repasse',
    'y'
  ].filter(Boolean) as string[];

  let xKey = xKeyCandidates.find(k => Object.prototype.hasOwnProperty.call(sample, k));
  let yKey = yKeyCandidates.find(k => Object.prototype.hasOwnProperty.call(sample, k));

  if (!xKey) {
    const keys = Object.keys(sample);
    xKey = keys.find(k => typeof sample[k] === 'string') || keys[0] || 'name';
  }

  if (!yKey) {
    const keys = Object.keys(sample);
    yKey =
      keys.find(k => typeof sample[k] === 'number') ||
      keys.find(k => !Number.isNaN(Number(sample[k]))) ||
      'value';
  }

  const normalized = data.map((item: any, index: number) => {
    const xVal = item?.[xKey!] ?? item?.name ?? item?.label ?? item?.entidade ?? `Item ${index + 1}`;
    const yRaw = item?.[yKey!] ?? item?.value ?? item?.valor ?? item?.repasse ?? 0;
    const yNum = Number(yRaw);

    return {
      ...item,
      [xKey!]: String(xVal),
      [yKey!]: Number.isFinite(yNum) ? yNum : 0
    };
  });

  return {
    type,
    data: normalized,
    xKey: xKey!,
    yKey: yKey!,
    color: safeString(config.color, '#4f46e5'),
    label: safeString(config.label, 'Valor')
  };
}

function ChartRenderer({ className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeString = String(children).trim();

  const isChartConfig =
    lang === 'json-chart' ||
    lang === 'jsonchart' ||
    (lang === 'json' && codeString.includes('"type":'));

  if (isChartConfig) {
    try {
      const cleanJson = codeString
        .replace(/\/\/.*$/gm, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      const rawConfig = JSON.parse(cleanJson);
      const config = normalizeChartConfig(rawConfig);
      const { type, data, xKey, yKey, color, label } = config;

      if (!data.length) {
        return (
          <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200 my-4 not-prose">
            Configuração de gráfico sem dados válidos.
          </div>
        );
      }

      const COLORS = [color, '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

      return (
        <div className="w-full h-72 my-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm not-prose">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey={yKey} name={label} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey={yKey}
                  name={label}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  dataKey={yKey}
                  nameKey={xKey}
                  label={({ name, percent }: any) => `${name ?? 'N/A'} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Tipo de gráfico não suportado: {type}
              </div>
            )}
          </ResponsiveContainer>
        </div>
      );
    } catch (e: any) {
      console.error('Error rendering chart:', e);
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 my-4 not-prose">
          Erro ao renderizar gráfico: {e?.message || 'configuração inválida'}.
        </div>
      );
    }
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

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
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Assistente de IA</h2>
            <p className="text-sm text-slate-500">Consulta inteligente aos dados de fomento, patrocínio, Infra-BR e normativos</p>
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
          <strong>Aviso:</strong> Este assistente responde exclusivamente com base nos dados do app e nos normativos carregados no contexto.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-60">
            <Bot size={64} className="text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Como posso ajudar?</h3>
            <p className="text-slate-500 text-sm">Você pode pedir relatórios, comparações e gráficos sobre fomento, patrocínio e Infra-BR.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-indigo-600" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#003865] text-white rounded-br-none' : 'bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-700'}`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-slate-800">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{ code: ChartRenderer }}>
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
            placeholder="Pergunte sobre dados e peça gráficos (ex.: gere um gráfico de barras com top 5 estados por repasse)..."
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