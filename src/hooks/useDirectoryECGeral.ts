import { useState, useMemo } from 'react';
import { ecGeralData } from '../data/ECGeral';
import { useData } from '../context/DataContext';

export function useDirectoryECGeral() {
  const { appData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [repasseFilter, setRepasseFilter] = useState('');
  const [cdenFilter, setCdenFilter] = useState('');
  const [precFilter, setPrecFilter] = useState('');

  const enrichedECGeral = useMemo(() => {
    const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/gi, '') : '';
    
    const lookups: { name: string; sigla?: string; cnpj: string; isFom?: boolean; isPat?: boolean; isCden?: boolean; isPrec?: boolean; source: string }[] = [];

    appData.fomentoHistorico.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isFom: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Fomento2025' }));
    appData.fomento2026.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isFom: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Fomento2026' }));
    appData.patrocinioHistorico.forEach(item => lookups.push({ name: item.ENTIDADE, cnpj: item.CNPJ, isPat: true, isCden: item.IsCDEN, isPrec: item.IsPrecursora, source: 'Patrocínio2025' }));
    appData.cden.forEach(item => lookups.push({ name: item.Entidade, cnpj: item.CNPJ, isCden: true, source: 'CDEN' }));
    appData.precursoras.forEach(item => lookups.push({ name: item.Entidade, sigla: item.Sigla, cnpj: item.CNPJ, isPrec: true, source: 'Precursoras' }));

    const nameCounts = new Map<string, number>();
    ecGeralData.forEach(item => {
        const n = normalize(item.denominacao);
        if (n) nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
    });

    return ecGeralData.map((ecItem, idx) => {
      const normDenom = normalize(ecItem.denominacao);
      const normSigla = normalize(ecItem.sigla);
      
      const cnpjs = new Set<string>();
      let isFomento = false;
      let isPatrocinio = false;
      let isCDEN = false;
      let isPrecursora = false;
      const obs = new Set<string>();

      const matchedLookups = lookups.filter(l => {
        const ln = normalize(l.name);
        const ls = l.sigla ? normalize(l.sigla) : null;
        if (normDenom && ln && ln === normDenom) return true;
        if (normSigla && ln && ln === normSigla) return true;
        if (normDenom && ls && ls === normDenom) return true;
        if (normSigla && ls && ls === normSigla) return true;
        return false;
      });

      const cnpjMap = new Map<string, Set<string>>();

      matchedLookups.forEach(m => {
        const cleanedCnpj = m.cnpj ? m.cnpj.replace(/\D/g, '') : '';
        if (cleanedCnpj.length === 14) {
          if (!cnpjMap.has(cleanedCnpj)) cnpjMap.set(cleanedCnpj, new Set());
          cnpjMap.get(cleanedCnpj)!.add(m.source);
        }
        if (m.isFom) isFomento = true;
        if (m.isPat) isPatrocinio = true;
        if (m.isCden) isCDEN = true;
        if (m.isPrec) isPrecursora = true;
      });

      if (cnpjMap.size > 1) {
        obs.add('Divergência de CNPJ');
      }
      
      const formatCnpj = (cnpj: string) => {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      };

      const cnpjsDetails = Array.from(cnpjMap.entries()).map(([cnpj, sources]) => ({
        cnpj: formatCnpj(cnpj),
        raw: cnpj,
        sources: Array.from(sources)
      }));

      const displayCnpj = cnpjsDetails.map(d => d.cnpj).join(' | ');

      if (normDenom && (nameCounts.get(normDenom) || 0) > 1) {
          obs.add('Duplicidade no EC Geral');
      }

      return {
        ...ecItem,
        originalIndex: idx,
        cnpjsDetails,
        displayCnpj,
        isFomento,
        isPatrocinio,
        isCDEN,
        isPrecursora,
        obs: Array.from(obs).join(', ')
      };
    });
  }, [appData]);

  const states = useMemo(() => {
    const s = new Set<string>();
    enrichedECGeral.forEach(item => {
      if (item.origem) {
        const state = item.origem.replace('Crea-', '').toUpperCase();
        if (state.length === 2) s.add(state);
      }
    });
    return Array.from(s).sort();
  }, [enrichedECGeral]);

  const types = useMemo(() => {
    const t = new Set<string>();
    enrichedECGeral.forEach(item => {
      if (item.tipo) t.add(item.tipo.trim());
    });
    return Array.from(t).filter(Boolean).sort();
  }, [enrichedECGeral]);

  const filteredData = useMemo(() => {
    return enrichedECGeral.filter(item => {
      const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '';
      const type = item.tipo ? item.tipo.trim() : '';

      const matchSearch = item.denominacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sigla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.displayCnpj?.includes(searchTerm);
      const matchState = stateFilter ? state === stateFilter : true;
      const matchType = typeFilter ? type === typeFilter : true;
      const matchCden = cdenFilter ? (cdenFilter === 'sim' ? item.isCDEN : !item.isCDEN) : true;
      const matchPrec = precFilter ? (precFilter === 'sim' ? item.isPrecursora : !item.isPrecursora) : true;

      let matchRepasse = true;
      if (repasseFilter === 'fomento') matchRepasse = item.isFomento;
      if (repasseFilter === 'patrocinio') matchRepasse = item.isPatrocinio;
      if (repasseFilter === 'ambos') matchRepasse = item.isFomento && item.isPatrocinio;
      if (repasseFilter === 'nenhum') matchRepasse = !item.isFomento && !item.isPatrocinio;

      return matchSearch && matchState && matchType && matchRepasse && matchCden && matchPrec;
    });
  }, [enrichedECGeral, searchTerm, stateFilter, typeFilter, repasseFilter, cdenFilter, precFilter]);

  return {
    state: {
      searchTerm, setSearchTerm,
      stateFilter, setStateFilter,
      typeFilter, setTypeFilter,
      repasseFilter, setRepasseFilter,
      cdenFilter, setCdenFilter,
      precFilter, setPrecFilter
    },
    options: {
      states,
      types
    },
    filteredData,
    totalCount: ecGeralData.length
  };
}
