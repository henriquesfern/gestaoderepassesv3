import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InfraRuntimeData } from '../../data/runtime-loaders';

type InfraLookupData = Pick<InfraRuntimeData, 'detalhamento'>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDimensionColor = (dimension: string) => {
  const dim = dimension.trim().toUpperCase();
  if (dim.includes('ENERGIA') || dim.includes('CONECTIVIDADE')) return "bg-amber-50 text-amber-700 border-amber-200";
  if (dim.includes('BEM-ESTAR') || dim.includes('CIDADANIA')) return "bg-cyan-50 text-cyan-700 border-cyan-200";
  if (dim.includes('MEIO AMBIENTE') || dim.includes('RESILIÊNCIA')) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (dim.includes('SANEAMENTO')) return "bg-teal-50 text-teal-700 border-teal-200";
  if (dim.includes('ÁGUA')) return "bg-sky-50 text-sky-700 border-sky-200";
  if (dim.includes('MOBILIDADE')) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export const getColorForChild = (childName: string, infraData: InfraLookupData) => {
  const normalized = childName.trim().toUpperCase();
  const found = infraData.detalhamento.find(d => 
    d.COMPONENTE.trim().toUpperCase() === normalized || 
    d.INDICADOR.trim().toUpperCase() === normalized
  );
  if (found) {
    return getDimensionColor(found.DIMENSAO);
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export const getSegmentColor = (index: number) => {
  const colors = [
    "bg-rose-500",    // 1ª dimensão
    "bg-orange-500",  // 2ª dimensão
    "bg-amber-500",   // 3ª dimensão
    "bg-lime-500",    // 4ª dimensão
    "bg-emerald-500", // 5ª dimensão
    "bg-green-600"    // 6ª dimensão
  ];
  return colors[index] || "bg-slate-200";
};

export interface TreeNode {
  rank: string;
  name: string;
  components: {
    rank: string;
    name: string;
    indicators: { rank: string; name: string }[];
  }[];
}

export const buildTree = (dimStr: string, compStr: string, indStr: string, infraData: InfraLookupData) => {
  const dims = dimStr ? dimStr.split('|').map(s => { const p = s.trim().split('-'); return { rank: p[0]?.trim() || '', name: p.slice(1).join('-').trim(), components: [] } }) : [];
  const comps = compStr ? compStr.split('|').map(s => { const p = s.trim().split('-'); return { rank: p[0]?.trim() || '', name: p.slice(1).join('-').trim(), indicators: [] } }) : [];
  const inds = indStr ? indStr.split('|').map(s => { const p = s.trim().split('-'); return { rank: p[0]?.trim() || '', name: p.slice(1).join('-').trim() } }) : [];
  
  const dimMap = new Map(dims.map(d => [d.name.toUpperCase(), d]));
  const compMap = new Map(comps.map(c => [c.name.toUpperCase(), c]));
  
  for (const ind of inds) {
    if(!ind.name) continue;
    const detail = infraData.detalhamento.find(d => d.INDICADOR.toUpperCase().trim() === ind.name.toUpperCase());
    if (detail) {
      let comp = compMap.get(detail.COMPONENTE.toUpperCase().trim());
      if (!comp) {
        comp = { rank: '', name: detail.COMPONENTE.trim(), indicators: [] };
        compMap.set(detail.COMPONENTE.toUpperCase().trim(), comp);
        comps.push(comp);
      }
      if (!comp.indicators.find(i => i.name === ind.name)) {
        comp.indicators.push(ind);
      }
      
      let dim = dimMap.get(detail.DIMENSAO.toUpperCase().trim());
      if (!dim) {
        dim = { rank: '', name: detail.DIMENSAO.trim(), components: [] };
        dimMap.set(detail.DIMENSAO.toUpperCase().trim(), dim);
        dims.push(dim);
      }
    }
  }

  for (const comp of comps) {
    if(!comp.name) continue;
    const detail = infraData.detalhamento.find(d => d.COMPONENTE.toUpperCase().trim() === comp.name.toUpperCase());
    if(detail) {
        let dim = dimMap.get(detail.DIMENSAO.toUpperCase().trim());
        if(!dim) {
            dim = { rank: '', name: detail.DIMENSAO.trim(), components: [] };
            dimMap.set(detail.DIMENSAO.toUpperCase().trim(), dim);
            dims.push(dim);
        }
        if (!dim.components.find(c => c.name === comp.name)) {
          dim.components.push(comp);
        }
    }
  }
  
  return dims as TreeNode[];
};
