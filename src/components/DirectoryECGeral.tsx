import React from 'react';
import { Building2, Filter } from 'lucide-react';
import { useDirectoryECGeral } from '../hooks/useDirectoryECGeral';
import { DirectoryECGeralFilters } from './directory/DirectoryECGeralFilters';
import { DirectoryECGeralRow } from './directory/DirectoryECGeralRow';

export function DirectoryECGeral() {
  const { state, options, filteredData, totalCount } = useDirectoryECGeral();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: '#003865' }}>
            <Building2 className="opacity-80 shrink-0 text-[#215F9A]" size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total de Entidades</p>
              <p className="text-6xl font-black tracking-tight text-[#003865]">{totalCount}</p>
            </div>
          </div>
          
          <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: '#3b82f6' }}>
            <Filter className="opacity-80 shrink-0 text-[#3b82f6]" size={64} />
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Entidades Filtradas</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black tracking-tight text-[#1e3a8a]">{filteredData.length}</p>
                <span className="text-xl font-medium text-slate-400">
                  ({totalCount > 0 ? ((filteredData.length / totalCount) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DirectoryECGeralFilters 
        searchTerm={state.searchTerm} setSearchTerm={state.setSearchTerm}
        stateFilter={state.stateFilter} setStateFilter={state.setStateFilter}
        typeFilter={state.typeFilter} setTypeFilter={state.setTypeFilter}
        repasseFilter={state.repasseFilter} setRepasseFilter={state.setRepasseFilter}
        cdenFilter={state.cdenFilter} setCdenFilter={state.setCdenFilter}
        precFilter={state.precFilter} setPrecFilter={state.setPrecFilter}
        states={options.states}
        types={options.types}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 flex justify-between items-center">
          <span>{filteredData.length} registros encontrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-medium whitespace-nowrap w-24">Repasse</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Sigla</th>
                <th className="px-6 py-4 font-medium">Nome (Denominação)</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">CNPJ</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-center">CDEN</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Precursora</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">UF</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Tipo</th>
                <th className="px-6 py-4 font-medium">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => (
                <DirectoryECGeralRow key={idx} item={item} />
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma entidade encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
