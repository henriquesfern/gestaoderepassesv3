import { useState, useMemo } from 'react';
import type { EntidadeSelecionada } from '../types';

export type SortKey = 'ENTIDADE' | 'CNPJ' | 'ESTADO' | 'IsCDEN' | 'VALOR_REPASSE' | 'NOTA' | 'tipoRepasse';

export function useDirectory(data: EntidadeSelecionada[]) {
  const selecionados = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterRegiao, setFilterRegiao] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterFiscal, setFilterFiscal] = useState<string>('all');
  const [filterRepasse, setFilterRepasse] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (cnpj: string) => {
    const next = new Set(expandedRows);
    if (next.has(cnpj)) {
      next.delete(cnpj);
    } else {
      next.add(cnpj);
    }
    setExpandedRows(next);
  };

  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null, direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const dataWithGlobalRank = useMemo(() => {
    const sorted = [...selecionados].sort((a, b) => b.NOTA - a.NOTA);
    const total = sorted.length;
    return sorted.map((item, index) => {
      const tipoRepasse: 'Fomento' | 'Patrocínio' = (item as any).tipoRepasse || 'Fomento';

      return {
        ...item,
        globalRank: index + 1,
        totalEntities: total,
        tipoRepasse
      };
    });
  }, [selecionados]);

  const estados = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.ESTADO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const regioes = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.REGIÃO).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const categorias = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.CATEGORIA).filter(Boolean))).sort(), [dataWithGlobalRank]);
  const fiscais = useMemo(() => Array.from(new Set(dataWithGlobalRank.map(item => item.FISCAL).filter(Boolean))).sort(), [dataWithGlobalRank]);

  const filteredData = useMemo(() => {
    let result = dataWithGlobalRank.filter(item => {
      const matchSearch = item.ENTIDADE.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.CNPJ.includes(searchTerm);
      
      let matchGrupo = true;
      if (filterGrupo === 'CDEN') {
        matchGrupo = item.IsCDEN;
      } else if (filterGrupo === 'PREC') {
        matchGrupo = item.IsPrecursora;
      } else if (filterGrupo === 'REG') {
        matchGrupo = !item.IsCDEN && !item.IsPrecursora;
      }
      
      const matchEstado = filterEstado === 'all' || item.ESTADO === filterEstado;
      const matchRegiao = filterRegiao === 'all' || item.REGIÃO === filterRegiao;
      
      let matchCategoria = true;
      if (filterCategoria === 'undefined_category') {
        matchCategoria = !item.CATEGORIA || item.CATEGORIA.trim() === '';
      } else if (filterCategoria !== 'all') {
        matchCategoria = item.CATEGORIA === filterCategoria;
      }

      let matchFiscal = true;
      if (filterFiscal === 'undefined_fiscal') {
        matchFiscal = !item.FISCAL || item.FISCAL.trim() === '';
      } else if (filterFiscal !== 'all') {
        matchFiscal = item.FISCAL === filterFiscal;
      }
      
      const matchRepasse = filterRepasse === 'all' || item.tipoRepasse === filterRepasse;
      
      return matchSearch && matchGrupo && matchEstado && matchRegiao && matchCategoria && matchFiscal && matchRepasse;
    });

    if (sortConfig.key) {
      result = result.sort((a, b) => {
        let aVal: any = a[sortConfig.key!];
        let bVal: any = b[sortConfig.key!];

        if (sortConfig.key === 'IsCDEN') {
          const getGroupValue = (item: any) => {
            if (item.IsCDEN) return 3;
            if (item.IsPrecursora) return 2;
            return 1;
          };
          aVal = getGroupValue(a);
          bVal = getGroupValue(b);
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [dataWithGlobalRank, searchTerm, filterGrupo, filterEstado, filterRegiao, filterCategoria, filterFiscal, filterRepasse, sortConfig]);

  return {
    state: {
      searchTerm, setSearchTerm,
      filterGrupo, setFilterGrupo,
      filterEstado, setFilterEstado,
      filterRegiao, setFilterRegiao,
      filterCategoria, setFilterCategoria,
      filterRepasse, setFilterRepasse,
      filterFiscal, setFilterFiscal,
      expandedRows, setExpandedRows,
      sortConfig, setSortConfig
    },
    actions: {
      toggleRow,
      handleSort
    },
    options: {
      estados,
      regioes,
      categorias,
      fiscais
    },
    filteredData
  };
}
