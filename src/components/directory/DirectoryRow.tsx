import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getDimensionColor, getColorForChild, getSegmentColor, buildTree } from './DirectoryUtils';
import { InfraBRProgressBar } from './InfraBRProgressBar';
import { motion, AnimatePresence } from 'motion/react';
import { formatCNPJ } from '../../utils/sanitizers';

export function DirectoryRow({ item, isExpanded, toggleRow, uniqueKey }: any) {
  const hasAnexoInfo = Boolean(item.OBJETIVO_COMPLETO || item.AREA_ABRANGENCIA || item.OBJETIVO_ESPECIFICO_COMPLETO || item.PUBLICO_ALVO || item.RANKING_ADERENCIA_INFRABR);

  return (
    <React.Fragment>
      <tr className={cn("hover:bg-slate-50 transition-colors cursor-pointer", isExpanded && "bg-slate-50")} onClick={() => toggleRow(uniqueKey)}>
        <td className="py-3 px-6">
          <div className="flex items-start">
            <button className="mr-3 mt-0.5 text-slate-400 hover:text-[#003865] flex-shrink-0 transition-colors">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div>
              <div className="font-medium text-slate-800 text-sm align-middle flex items-center">
                {item.ENTIDADE}
                {item.RANKING_ADERENCIA_INFRABR && (
                  <div className="ml-3 mt-0.5" title={`${item.RANKING_ADERENCIA_INFRABR.split('|').length}/6 Dimensões Infra-BR`}>
                    <div className="flex gap-0.5 h-1.5 w-12">
                      {[...Array(6)].map((_, i) => {
                        const count = item.RANKING_ADERENCIA_INFRABR!.split('|').length;
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "flex-1 rounded-full",
                              i < count ? getSegmentColor(i) : "bg-slate-200"
                            )} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-start gap-1">
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap",
            item.CATEGORIA?.toLowerCase() === "direcionamento estratégico local" ? "bg-blue-50 text-blue-700 border-blue-200" :
            item.CATEGORIA?.toLowerCase() === "identificação e proposição de soluções" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            item.CATEGORIA?.toLowerCase() === "mapeamento de recursos" ? "bg-amber-50 text-amber-700 border-amber-200" :
            item.CATEGORIA?.toLowerCase() === "evento" ? "bg-purple-50 text-purple-700 border-purple-200" :
            item.CATEGORIA?.toLowerCase() === "revista" ? "bg-pink-50 text-pink-700 border-pink-200" :
            item.CATEGORIA?.toLowerCase() === "livro" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
            item.CATEGORIA?.toLowerCase() === "atividade principal do sistema confea/crea" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
            item.CATEGORIA?.toLowerCase() === "transparência, legalidade e legitimidade do sistema confea/crea" ? "bg-teal-50 text-teal-700 border-teal-200" :
            item.CATEGORIA?.toLowerCase() === "papel do sistema confea/crea" ? "bg-rose-50 text-rose-700 border-rose-200" :
            item.CATEGORIA?.toLowerCase() === "erro" ? "bg-red-50 text-red-700 border-red-200" :
            "bg-slate-100 text-slate-600 border-slate-200"
          )} title={item.CATEGORIA || "Não definido"}>
            {item.OBJETIVO || "Não definido"}
          </span>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Fiscal do Processo">
            Fiscal: {item.FISCAL || "Não definido"}
          </span>
          {item.FISCAL_SUPLENTE && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Fiscal Suplente">
              Suplente: {item.FISCAL_SUPLENTE}
            </span>
          )}
          {item.DATA_INICIO && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Período">
              {item.DATA_INICIO} {item.DATA_FIM && ` a ${item.DATA_FIM}`}
            </span>
          )}
          {item.MES && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap" title="Mês">
              {item.MES}
            </span>
          )}
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap" title="Número SEI">
            SEI: {item.SEI || "Não informado"}
          </span>
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap",
            item.tipoRepasse === 'Fomento' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
            "bg-orange-500/10 text-orange-700 border-orange-500/20"
          )} title="Tipo de Repasse">
            {item.tipoRepasse}
          </span>
        </div>
        {item.RANKING_ADERENCIA_INFRABR && (
          <div className="mt-2 w-full max-w-2xl bg-white/50 p-2 rounded border border-slate-100 shadow-sm">
            <InfraBRProgressBar 
              count={item.RANKING_ADERENCIA_INFRABR.split('|').length} 
              className="mb-2"
            />
            <div className="flex flex-wrap items-start gap-1">
              {item.RANKING_ADERENCIA_INFRABR.split('|').map((dim: string, dIdx: number) => {
                const parts = dim.trim().split('-');
                const rank = parts[0];
                const name = parts.slice(1).join('-');
                return (
                  <span key={dIdx} className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap",
                    getDimensionColor(name)
                  )}>
                    <span className="opacity-50 mr-1">{rank}</span> {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
      </td>
      <td className="py-3 px-6 text-[10px] text-slate-600 font-mono whitespace-nowrap align-top">{formatCNPJ(item.CNPJ)}</td>
      <td className="py-3 px-6 align-top">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
          {item.ESTADO}
        </span>
      </td>
      <td className="py-3 px-6 text-center align-top">
        {item.IsCDEN && item.IsPrecursora ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] leading-tight font-bold bg-indigo-100 text-indigo-800 border border-indigo-200" title="CDEN e Precursora">CDEN/PREC</span>
        ) : item.IsCDEN ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200" title="CDEN">CDEN</span>
        ) : item.IsPrecursora ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Precursora">PREC</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200" title="Regular">REG</span>
        )}
      </td>
      <td className="py-3 px-6 text-sm font-semibold text-slate-800 text-right whitespace-nowrap">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.VALOR_REPASSE)}
      </td>
      <td className="py-3 px-6 text-right">
        <div className="text-sm font-semibold text-slate-800">
          {item.NOTA.toFixed(2).replace('.', ',')}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 whitespace-nowrap">
          {item.globalRank}º/{item.totalEntities}
        </div>
      </td>
    </tr>
    <AnimatePresence>
      {isExpanded && (
        <motion.tr 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-50 overflow-hidden" 
          style={{ display: 'table-row' }} // framer motion on tr workaround can be tricky, typically better as <td colSpan><motion.div>
        >
          <td colSpan={6} className="p-0 border-b border-slate-200">
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="px-10 py-4 space-y-4 text-sm w-full"
            >
              {item.RANKING_ADERENCIA_INFRABR ? (
                <div className="bg-[#003865]/5 p-4 rounded-lg border border-[#003865]/10">
                  <h4 className="font-semibold text-[#003865] mb-2 text-xs uppercase tracking-wide flex items-center">
                    <span className="w-2 h-2 bg-[#003865] rounded-full mr-2"></span>
                    Aderência Setorial Infra-BR
                  </h4>
                  <InfraBRProgressBar 
                    count={item.RANKING_ADERENCIA_INFRABR.split('|').length} 
                    className="mb-4"
                  />
                  
                  <div className="flex flex-col gap-4">
                    {buildTree(
                      item.RANKING_ADERENCIA_INFRABR || '',
                      item.RANKING_COMPONENTES || '',
                      item.RANKING_INDICADORES || ''
                    ).map((dim, dIdx) => (
                      <div key={dIdx} className="flex flex-col gap-2">
                        <div className={cn("inline-flex flex-col items-start px-3 py-1.5 border rounded shadow-sm text-left w-fit", getDimensionColor(dim.name))}>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">{dim.rank}</span>
                            <span className="text-xs font-semibold leading-tight">{dim.name}</span>
                        </div>
                        
                        {dim.components.length > 0 && (
                          <div className="pl-4 border-l-2 border-slate-200/60 ml-2 mt-1 flex flex-col gap-3">
                            {dim.components.map((comp, cIdx) => (
                              <div key={cIdx} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-300 text-xs">└─&gt;</span>
                                  <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded border shadow-sm", getColorForChild(comp.name))}>
                                    <span className="text-[11px] font-semibold leading-tight">{comp.name}</span>
                                  </div>
                                </div>

                                {comp.indicators.length > 0 && (
                                  <div className="pl-6 flex flex-col gap-1.5">
                                    {comp.indicators.map((ind, iIdx) => (
                                      <div key={iIdx} className="flex items-center gap-2">
                                        <span className="text-slate-300 text-xs">└─&gt;</span>
                                        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded border shadow-sm bg-white/60", getColorForChild(ind.name))}>
                                          <span className="text-[10px] font-medium leading-tight">{ind.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {item.OBJETIVO_COMPLETO ? (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1 text-xs uppercase tracking-wide">Objetivo Completo</h4>
                  <p className="text-slate-600 leading-relaxed">{item.OBJETIVO_COMPLETO}</p>
                </div>
              ) : null}
              {item.OBJETIVO_ESPECIFICO_COMPLETO ? (
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1 text-xs uppercase tracking-wide">Objetivo Específico</h4>
                  <p className="text-slate-600 leading-relaxed">{item.OBJETIVO_ESPECIFICO_COMPLETO}</p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-6">
                {item.PUBLICO_ALVO ? (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1 text-xs uppercase tracking-wide">Público Alvo</h4>
                    <p className="text-slate-600">{item.PUBLICO_ALVO}</p>
                  </div>
                ) : null}
                {item.AREA_ABRANGENCIA ? (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1 text-xs uppercase tracking-wide">Área de Abrangência</h4>
                    <p className="text-slate-600">{item.AREA_ABRANGENCIA}</p>
                  </div>
                ) : null}
              </div>
              {!hasAnexoInfo && (
                <div className="p-4 bg-white border border-slate-200 rounded-md text-slate-500 italic">
                  Detalhes do anexo não disponíveis para esta entidade.
                </div>
              )}
            </motion.div>
          </td>
        </motion.tr>
      )}
    </AnimatePresence>
    </React.Fragment>
  );
}
