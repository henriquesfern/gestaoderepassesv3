import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

export const stateSiglaToName: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AM': 'Amazonas', 'AP': 'Amapá', 'BA': 'Bahia', 'CE': 'Ceará',
  'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MG': 'Minas Gerais',
  'MS': 'Mato Grosso do Sul', 'MT': 'Mato Grosso', 'PA': 'Pará', 'PB': 'Paraíba', 'PE': 'Pernambuco',
  'PI': 'Piauí', 'PR': 'Paraná', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RO': 'Rondônia',
  'RR': 'Roraima', 'RS': 'Rio Grande do Sul', 'SC': 'Santa Catarina', 'SE': 'Sergipe', 'SP': 'São Paulo',
  'TO': 'Tocantins'
};

export const nameToSigla = Object.fromEntries(Object.entries(stateSiglaToName).map(([k, v]) => [v, k]));

export function useInfraBRMetrics() {
  const { appData } = useData();
  const infraData = appData.infraBR;
  const [selectedState, setSelectedState] = useState<string>('SP');
  const [selectedDimension, setSelectedDimension] = useState<string>('SANEAMENTO BÁSICO');

  // Calculate total repasse per state
  const stateRepasse = useMemo(() => {
    const map = new Map<string, number>();
    const allData = [...appData.fomentoHistorico, ...appData.patrocinioHistorico, ...appData.fomento2026];
    
    allData.forEach(item => {
      if (!item.ESTADO) return;
      map.set(item.ESTADO, (map.get(item.ESTADO) || 0) + item.VALOR_REPASSE);
    });
    return map;
  }, [appData]);

  // Breakdown Repasse
  const stateRepasseBreakdown = useMemo(() => {
    const map = new Map<string, { fomento26: number, fomento25: number, patrocinio25: number }>();
    
    appData.fomento2026.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.fomento26 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    appData.fomentoHistorico.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.fomento25 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    appData.patrocinioHistorico.forEach(item => {
      if (!item.ESTADO) return;
      const current = map.get(item.ESTADO) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
      current.patrocinio25 += item.VALOR_REPASSE;
      map.set(item.ESTADO, current);
    });

    return map;
  }, [appData]);

  // Correlation Data (Repasse vs Infra)
  const correlationData = useMemo(() => {
    return infraData.infraEstados.map(state => {
      const stateFullName = stateSiglaToName[state.sigla_uf] || state.sigla_uf;
      const repasse = stateRepasse.get(stateFullName) || 0;
      return {
        uf: state.sigla_uf,
        name: stateFullName,
        infra_br: state.infra_br,
        repasse: repasse,
        rank: state.rank,
        sizeScore: repasse > 0 ? (repasse / state.rank) : 0, 
      };
    }).sort((a, b) => b.repasse - a.repasse);
  }, [stateRepasse]);

  const avgInfraBR = useMemo(() => {
    if (correlationData.length === 0) return 0;
    return correlationData.reduce((sum, item) => sum + item.infra_br, 0) / correlationData.length;
  }, [correlationData]);

  const avgRepasse = useMemo(() => {
    if (correlationData.length === 0) return 0;
    return correlationData.reduce((sum, item) => sum + item.repasse, 0) / correlationData.length;
  }, [correlationData]);

  const radarData = useMemo(() => {
    const stateDims = infraData.dimensoes.filter(d => d.sigla_uf === selectedState);
    return stateDims.map(d => {
      const media = infraData.mediasBR.find(m => m.dimensao === d.dimension_name)?.media_pais_pct || 0;
      return {
        dimensao: d.dimension_name,
        estado: d.value,
        mediaBR: media,
        fullMark: 100
      };
    });
  }, [selectedState]);

  const componentData = useMemo(() => {
    return infraData.componentes
      .filter(c => c.sigla_uf === selectedState && c.dimension_name === selectedDimension)
      .map(c => ({
        name: c.component_name,
        value: c.value
      }))
      .sort((a,b) => b.value - a.value);
  }, [selectedState, selectedDimension]);

  const availableDimensions = useMemo(() => {
    return Array.from(new Set(infraData.dimensoes.map(d => d.dimension_name))).sort();
  }, []);

  return {
    state: {
      selectedState, setSelectedState,
      selectedDimension, setSelectedDimension
    },
    metrics: {
      infraData,
      stateRepasse,
      stateRepasseBreakdown,
      correlationData,
      avgInfraBR,
      avgRepasse,
      radarData,
      componentData,
      availableDimensions
    }
  };
}
