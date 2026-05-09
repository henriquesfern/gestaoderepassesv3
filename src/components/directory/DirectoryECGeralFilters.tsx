import React from 'react';
import { Search } from 'lucide-react';

interface DirectoryECGeralFiltersProps {
  searchTerm: string; setSearchTerm: (v: string) => void;
  stateFilter: string; setStateFilter: (v: string) => void;
  typeFilter: string; setTypeFilter: (v: string) => void;
  repasseFilter: string; setRepasseFilter: (v: string) => void;
  cdenFilter: string; setCdenFilter: (v: string) => void;
  precFilter: string; setPrecFilter: (v: string) => void;
  states: string[];
  types: string[];
}

export function DirectoryECGeralFilters({
  searchTerm, setSearchTerm,
  stateFilter, setStateFilter,
  typeFilter, setTypeFilter,
  repasseFilter, setRepasseFilter,
  cdenFilter, setCdenFilter,
  precFilter, setPrecFilter,
  states,
  types
}: DirectoryECGeralFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex-1 w-full max-w-md">
        <label className="block text-sm font-medium text-slate-500 mb-1">Buscar Entidade</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Nome ou Sigla..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4 w-full sm:w-auto">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Estado</label>
          <select
            className="w-full sm:w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Repasse</label>
          <select
            className="w-full sm:w-36 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={repasseFilter}
            onChange={(e) => setRepasseFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="fomento">Fomento</option>
            <option value="patrocinio">Patrocínio</option>
            <option value="ambos">Ambos</option>
            <option value="nenhum">Nenhum</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">CDEN</label>
          <select
            className="w-full sm:w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={cdenFilter}
            onChange={(e) => setCdenFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Precursora</label>
          <select
            className="w-full sm:w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={precFilter}
            onChange={(e) => setPrecFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Tipo</label>
          <select
            className="w-full sm:w-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
