import React from 'react';
import { appData } from '../data/parser';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { EntidadeSelecionada } from '../types';
import { useDirectory, type SortKey } from '../hooks/useDirectory';
import { DirectoryFilters } from './directory/DirectoryFilters';
import { DirectoryRow } from './directory/DirectoryRow';

interface DirectoryProps {
  data?: EntidadeSelecionada[];
}

export function Directory({ data = appData.fomento2026 }: DirectoryProps) {
  const { state, actions, options, filteredData } = useDirectory(data);

  const renderSortIndicator = (key: SortKey) => {
    if (state.sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 inline-block text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />;
    }
    return state.sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 inline-block text-[#003865]" /> : <ArrowDown size={14} className="ml-1 inline-block text-[#003865]" />;
  };

  return (
    <div className="bg-white border border-[#003865]/20 shadow-sm flex flex-col h-full rounded-none">
      <div className="p-6 border-b border-[#003865]/10">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Diretório de Entidades Selecionadas</h3>
        <DirectoryFilters 
          searchTerm={state.searchTerm} setSearchTerm={state.setSearchTerm}
          filterRepasse={state.filterRepasse} setFilterRepasse={state.setFilterRepasse}
          filterGrupo={state.filterGrupo} setFilterGrupo={state.setFilterGrupo}
          filterRegiao={state.filterRegiao} setFilterRegiao={state.setFilterRegiao}
          filterEstado={state.filterEstado} setFilterEstado={state.setFilterEstado}
          filterCategoria={state.filterCategoria} setFilterCategoria={state.setFilterCategoria}
          filterFiscal={state.filterFiscal} setFilterFiscal={state.setFilterFiscal}
          options={options}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('ENTIDADE')}>
                <div className="flex items-center">Entidade {renderSortIndicator('ENTIDADE')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('CNPJ')}>
                <div className="flex items-center">CNPJ {renderSortIndicator('CNPJ')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('ESTADO')}>
                <div className="flex items-center">Estado {renderSortIndicator('ESTADO')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-center cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('IsCDEN')}>
                <div className="flex items-center justify-center">Grupo {renderSortIndicator('IsCDEN')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('VALOR_REPASSE')}>
                <div className="flex items-center justify-end">Valor do Repasse {renderSortIndicator('VALOR_REPASSE')}</div>
              </th>
              <th className="py-3 px-6 text-xs font-semibold text-[#003865] uppercase tracking-wider border-b border-[#003865]/10 text-right cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => actions.handleSort('NOTA')}>
                <div className="flex items-center justify-end">Nota Final {renderSortIndicator('NOTA')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">Nenhuma entidade encontrada.</td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                const uniqueKey = item.CNPJ + idx;
                const isExpanded = state.expandedRows.has(uniqueKey);

                return (
                  <DirectoryRow 
                    key={uniqueKey} 
                    item={item} 
                    isExpanded={isExpanded} 
                    toggleRow={actions.toggleRow} 
                    uniqueKey={uniqueKey} 
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-right font-medium">
        Total exibido: {filteredData.length}
      </div>
    </div>
  );
}
