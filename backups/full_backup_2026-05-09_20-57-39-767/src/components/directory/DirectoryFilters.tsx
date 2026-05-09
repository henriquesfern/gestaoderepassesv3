import React from 'react';
import { Search, Filter } from 'lucide-react';

interface DirectoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterRepasse: string;
  setFilterRepasse: (v: string) => void;
  filterGrupo: string;
  setFilterGrupo: (v: string) => void;
  filterRegiao: string;
  setFilterRegiao: (v: string) => void;
  filterEstado: string;
  setFilterEstado: (v: string) => void;
  filterCategoria: string;
  setFilterCategoria: (v: string) => void;
  filterFiscal: string;
  setFilterFiscal: (v: string) => void;
  options: {
    regioes: string[];
    estados: string[];
    categorias: string[];
    fiscais: string[];
  }
}

export function DirectoryFilters({
  searchTerm, setSearchTerm,
  filterRepasse, setFilterRepasse,
  filterGrupo, setFilterGrupo,
  filterRegiao, setFilterRegiao,
  filterEstado, setFilterEstado,
  filterCategoria, setFilterCategoria,
  filterFiscal, setFilterFiscal,
  options
}: DirectoryFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865] focus:border-transparent text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Repasse:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
            value={filterRepasse}
            onChange={(e) => setFilterRepasse(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="Fomento">Fomento</option>
            <option value="Patrocínio">Patrocínio</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Grupo:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="CDEN">CDEN</option>
            <option value="PREC">Precursoras</option>
            <option value="REG">Outras</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Região:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
            value={filterRegiao}
            onChange={(e) => setFilterRegiao(e.target.value)}
          >
            <option value="all">Todas</option>
            {options.regioes.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Estado:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="all">Todos</option>
            {options.estados.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Categoria:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white max-w-[200px] truncate"
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            title={filterCategoria === 'all' ? 'Todas' : filterCategoria === 'undefined_category' ? 'Categoria não definida' : filterCategoria}
          >
            <option value="all">Todas</option>
            <option value="undefined_category">Sem categoria</option>
            {options.categorias.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600 flex items-center"><Filter size={16} className="mr-1"/> Fiscal:</span>
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003865] bg-white max-w-[200px] truncate"
            value={filterFiscal}
            onChange={(e) => setFilterFiscal(e.target.value)}
            title={filterFiscal === 'all' ? 'Todos' : filterFiscal === 'undefined_fiscal' ? 'Fiscal não definido' : filterFiscal}
          >
            <option value="all">Todos</option>
            <option value="undefined_fiscal">Fiscal não definido</option>
            {options.fiscais.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
