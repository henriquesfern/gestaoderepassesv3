import React, { useState, useMemo } from 'react';
import { Building2, Search, ExternalLink, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { getEntidadesCadastro, type EntidadeCadastro } from '../data/entidadesCadastro';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

const SITUACAO_COLOR: Record<string, string> = {
  ATIVA:        'bg-emerald-100 text-emerald-700',
  BAIXADA:      'bg-red-100 text-red-700',
  SUSPENSA:     'bg-red-100 text-red-600',
  INAPTA:       'bg-red-100 text-red-600',
  NULA:         'bg-red-100 text-red-500',
  DESCONHECIDA: 'bg-amber-100 text-amber-700',
};

function titleCaseMun(s: string): string {
  if (!s) return s;
  const lower = new Set(['de','da','do','das','dos','e','a','o','em','no','na','nos','nas','d']);
  return s.toLowerCase().split(' ').map((w, i) => {
    if (!w) return w;
    return i === 0 || !lower.has(w)
      ? w.charAt(0).toUpperCase() + w.slice(1)
      : w;
  }).join(' ');
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface RepasseHistorico {
  ano: string;
  tipo: 'Fomento' | 'Patrocínio';
  valor: number;
  projeto?: string;
  estado?: string;
}

interface EntidadeEnriquecida extends EntidadeCadastro {
  repasses: RepasseHistorico[];
  totalRepasses: number;
}

// ── Componente de detalhe ─────────────────────────────────────────────────────

function DetalheEntidade({
  entidade, onClose,
}: { entidade: EntidadeEnriquecida; onClose: () => void }) {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const repassesVisiveis = mostrarTodos ? entidade.repasses : entidade.repasses.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-bold text-slate-800 text-sm leading-tight">{entidade.razaoSocial}</h2>
            {entidade.sigla && <p className="text-xs text-slate-500 mt-0.5">{entidade.sigla}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Dados cadastrais */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados Cadastrais (Receita Federal)</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-slate-400">CNPJ</dt>
                <dd className="font-mono font-medium text-slate-700">
                  {entidade.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Situação</dt>
                <dd>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${SITUACAO_COLOR[entidade.situacaoCadastral.toUpperCase()] ?? SITUACAO_COLOR.DESCONHECIDA}`}>
                    {entidade.situacaoCadastral}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Município sede</dt>
                <dd className="font-medium text-slate-700">{titleCaseMun(entidade.municipio)}/{entidade.uf}</dd>
              </div>
              {entidade.dataInicioAtividade && (
                <div>
                  <dt className="text-slate-400">Início de atividade</dt>
                  <dd className="font-medium text-slate-700">
                    {entidade.dataInicioAtividade.split('-').reverse().join('/')}
                    {entidade.fundacao && ` (fundada em ${entidade.fundacao})`}
                  </dd>
                </div>
              )}
              {entidade.atividadePrincipal && (
                <div className="col-span-2">
                  <dt className="text-slate-400">Atividade principal</dt>
                  <dd className="text-slate-600 leading-snug">{entidade.atividadePrincipal}</dd>
                </div>
              )}
              {entidade.email && (
                <div className="col-span-2">
                  <dt className="text-slate-400">E-mail registrado</dt>
                  <dd className="text-slate-600">{entidade.email}</dd>
                </div>
              )}
              {entidade.telefone && (
                <div>
                  <dt className="text-slate-400">Telefone</dt>
                  <dd className="text-slate-600">{entidade.telefone}</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex gap-2">
              {entidade.isCDEN && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">CDEN</span>}
              {entidade.isPrecursora && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">Precursora</span>}
              <a
                href={`https://cnpj.biz/${entidade.cnpj}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                Conferir cadastro <ExternalLink size={9} />
              </a>
            </div>
          </section>

          {/* Histórico de repasses */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Histórico de Repasses
              </h3>
              {entidade.totalRepasses > 0 && (
                <span className="text-xs font-bold text-emerald-600">{formatBRL(entidade.totalRepasses)}</span>
              )}
            </div>
            {entidade.repasses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum repasse registrado.</p>
            ) : (
              <div className="space-y-1.5">
                {repassesVisiveis.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${r.tipo === 'Fomento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.tipo === 'Fomento' ? 'Fom.' : 'Pat.'} {r.ano}
                    </span>
                    <span className="flex-1 text-[11px] text-slate-600 truncate" title={r.projeto}>{r.projeto || '—'}</span>
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-600">{formatBRL(r.valor)}</span>
                  </div>
                ))}
                {entidade.repasses.length > 8 && (
                  <button
                    onClick={() => setMostrarTodos(!mostrarTodos)}
                    className="text-[11px] text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1"
                  >
                    {mostrarTodos
                      ? <><ChevronUp size={12} /> Mostrar menos</>
                      : <><ChevronDown size={12} /> Ver todos ({entidade.repasses.length})</>}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ── View principal ─────────────────────────────────────────────────────────────

export function AcompanhamentoEntidadesView() {
  const { appData } = useData();
  const [busca, setBusca] = useState('');
  const [filtroUF, setFiltroUF] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [entidadeSelecionada, setEntidadeSelecionada] = useState<EntidadeEnriquecida | null>(null);

  // Constrói mapa de repasses por CNPJ
  const repassesPorCNPJ = useMemo(() => {
    const m = new Map<string, RepasseHistorico[]>();
    const add = (cnpj: string, r: RepasseHistorico) => {
      if (!m.has(cnpj)) m.set(cnpj, []);
      m.get(cnpj)!.push(r);
    };

    appData.fomento2026.forEach(e => {
      if (e.CNPJ) add(e.CNPJ.replace(/\D/g, '').padStart(14, '0'), {
        ano: '2026', tipo: 'Fomento', valor: e.VALOR_REPASSE,
        projeto: e.OBJETIVO?.slice(0, 60), estado: e.ESTADO,
      });
    });
    appData.fomentoHistorico.forEach(e => {
      if (e.CNPJ) add(e.CNPJ.replace(/\D/g, '').padStart(14, '0'), {
        ano: '2025', tipo: 'Fomento', valor: e.VALOR_REPASSE,
        projeto: e.OBJETIVO?.slice(0, 60), estado: e.ESTADO,
      });
    });
    appData.patrocinioHistorico.forEach(e => {
      if (e.CNPJ) add(e.CNPJ.replace(/\D/g, '').padStart(14, '0'), {
        ano: '2025', tipo: 'Patrocínio', valor: e.VALOR_REPASSE,
        projeto: e.OBJETIVO?.slice(0, 60), estado: e.ESTADO,
      });
    });
    return m;
  }, [appData]);

  // Lista enriquecida de entidades
  const entidades: EntidadeEnriquecida[] = useMemo(() => {
    return getEntidadesCadastro().map(e => {
      const repasses = repassesPorCNPJ.get(e.cnpj) ?? [];
      return {
        ...e,
        repasses: repasses.sort((a, b) => b.ano.localeCompare(a.ano)),
        totalRepasses: repasses.reduce((s, r) => s + r.valor, 0),
      };
    });
  }, [repassesPorCNPJ]);

  // Opções de filtros
  const ufs = useMemo(() => [...new Set(entidades.map(e => e.uf).filter(Boolean))].sort(), [entidades]);
  const situacoes = useMemo(() => [...new Set(entidades.map(e => e.situacaoCadastral).filter(Boolean))].sort(), [entidades]);

  // Filtragem
  const filtradas = useMemo(() => {
    const qRaw  = busca.trim();
    const qCNPJ = qRaw.replace(/\D/g, '');   // aceita máscara: "12.345.678/0001-90"
    const q     = normalizar(qRaw);
    return entidades.filter(e => {
      if (filtroUF && e.uf !== filtroUF) return false;
      if (filtroSituacao && e.situacaoCadastral !== filtroSituacao) return false;
      if (filtroTipo === 'CDEN' && !e.isCDEN) return false;
      if (filtroTipo === 'Precursora' && !e.isPrecursora) return false;
      if (filtroTipo === 'ComRepasse' && e.totalRepasses === 0) return false;
      if (qRaw) {
        const cnpjMatch = qCNPJ.length >= 4 && e.cnpj.includes(qCNPJ);
        const nome  = normalizar(e.razaoSocial);
        const mun   = normalizar(e.municipio);
        const sigla = normalizar(e.sigla ?? '');
        if (!cnpjMatch && !nome.includes(q) && !mun.includes(q) && !sigla.includes(q)) return false;
      }
      return true;
    });
  }, [entidades, busca, filtroUF, filtroSituacao, filtroTipo]);

  const totalComRepasse = entidades.filter(e => e.totalRepasses > 0).length;
  const totalAtivas = entidades.filter(e => e.situacaoCadastral.toUpperCase() === 'ATIVA').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Building2 className="text-[#215F9A]" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Acompanhamento de Entidades</h2>
          <p className="text-slate-500">
            {entidades.length} entidades cadastradas · {totalAtivas} ativas · {totalComRepasse} com repasse registrado
          </p>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total cadastradas', value: entidades.length, color: 'text-blue-700' },
          { label: 'Situação ativa', value: totalAtivas, color: 'text-emerald-600' },
          { label: 'Com repasse (2025-26)', value: totalComRepasse, color: 'text-indigo-600' },
          { label: 'CDEN', value: entidades.filter(e => e.isCDEN).length, color: 'text-violet-600' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Busca e filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, sigla ou município…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>
          <select value={filtroUF} onChange={e => setFiltroUF(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
            <option value="">Todos os estados</option>
            {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <select value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
            <option value="">Toda situação</option>
            {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
            <option value="">Todos os tipos</option>
            <option value="CDEN">CDEN</option>
            <option value="Precursora">Precursoras</option>
            <option value="ComRepasse">Com repasse registrado</option>
          </select>
        </div>
        {(busca || filtroUF || filtroSituacao || filtroTipo) && (
          <p className="text-xs text-slate-500 mt-2">
            {filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''} encontrado{filtradas.length !== 1 ? 's' : ''}
            {' '}
            <button onClick={() => { setBusca(''); setFiltroUF(''); setFiltroSituacao(''); setFiltroTipo(''); }}
              className="text-blue-500 hover:text-blue-700 underline">Limpar filtros</button>
          </p>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Entidade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Município/UF</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Situação</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wide">Repasses</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Nenhuma entidade encontrada.</td></tr>
              )}
              {filtradas.map(e => (
                <tr key={e.cnpj}
                  onClick={() => setEntidadeSelecionada(e)}
                  className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700 text-xs leading-snug">{e.razaoSocial}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {e.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                      {e.sigla && ` · ${e.sigla}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{titleCaseMun(e.municipio) || '—'}/{e.uf || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SITUACAO_COLOR[e.situacaoCadastral.toUpperCase()] ?? SITUACAO_COLOR.DESCONHECIDA}`}>
                      {e.situacaoCadastral}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-emerald-600">
                    {e.totalRepasses > 0 ? formatBRL(e.totalRepasses) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {e.isCDEN && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">CDEN</span>}
                      {e.isPrecursora && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-semibold">Prec.</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel de detalhe */}
      {entidadeSelecionada && (
        <DetalheEntidade
          entidade={entidadeSelecionada}
          onClose={() => setEntidadeSelecionada(null)}
        />
      )}
    </div>
  );
}
