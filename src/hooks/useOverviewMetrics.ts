import { useMemo, useState, useEffect } from 'react';
import { geoMercator } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { useData } from '../context/DataContext';
import { infraData } from '../data/infraBR_parser';
import { getStateSigla } from '../data/regions';
import { getCityCoords } from '../data/municipalities';
import { EntidadeSelecionada } from '../types';

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

export const UF_TO_REGION: Record<string, string> = {
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul'
};

export function useOverviewMetrics(
  selecionados: EntidadeSelecionada[],
  theme: string,
  showEntityCount: boolean,
  colorScaleStart: string,
  colorScaleEnd: string
) {
  const { appData } = useData();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedInfraDimension, setSelectedInfraDimension] = useState<string | null>(null);
  const [selectedInfraComponent, setSelectedInfraComponent] = useState<string | null>(null);
  const [mapTooltip, setMapTooltip] = useState<any>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(geoUrl).then(res => res.json()).then(data => setGeoData(data));
  }, []);

  const clearFilters = () => {
    setSelectedState(null);
    setSelectedCategoria(null);
    setSelectedInfraDimension(null);
    setSelectedInfraComponent(null);
  };

  const filteredData = useMemo(() => {
    return selecionados.filter(item => {
      const matchState = !selectedState || item.ESTADO === selectedState;
      const matchCategoria = !selectedCategoria || item.CATEGORIA === selectedCategoria;
      return matchState && matchCategoria;
    });
  }, [selecionados, selectedState, selectedCategoria]);

  const kpis = useMemo(() => {
    const totalRepasse = filteredData.reduce((sum, item) => sum + item.VALOR_REPASSE, 0);
    let totalHits = 0;
    const uniqueDimensionsSet = new Set<string>();

    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

    filteredData.forEach(item => {
      if (item.RANKING_ADERENCIA_INFRABR) {
        const dims = item.RANKING_ADERENCIA_INFRABR.split('|');
        totalHits += dims.length;
        dims.forEach(d => {
          const p = d.trim();
          const dashIndex = p.indexOf('-');
          const namePartRaw = dashIndex !== -1 ? p.substring(dashIndex + 1).trim() : p.trim();
          const namePartNorm = normalize(namePartRaw);
          if (namePartNorm) uniqueDimensionsSet.add(namePartNorm);
        });
      }
    });

    const totalPossibleDimensions = filteredData.length * 6;
    const avgDimensions = filteredData.length > 0 ? (totalHits / filteredData.length) : 0;
    const avgPercentage = (avgDimensions / 6) * 100;

    return {
      total: filteredData.length,
      totalFomentado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRepasse),
      avgPercentage,
      totalDimensions: uniqueDimensionsSet.size,
      totalPossibleDimensions,
      avgDimensions
    };
  }, [filteredData]);

  const regionData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, number>();
    dataToUse.forEach(item => {
      const region = item.REGIÃO || 'Indefinida';
      map.set(region, (map.get(region) || 0) + item.VALOR_REPASSE);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [selecionados, selectedCategoria]);

  const stateData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, number>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      map.set(state, (map.get(state) || 0) + item.VALOR_REPASSE);
    });
    return map;
  }, [selecionados, selectedCategoria]);

  const stateBreakdownData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, { fomento: number, patrocinio: number }>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      const current = map.get(state) || { fomento: 0, patrocinio: 0 };
      if (item.tipoRepasse === 'Patrocínio' || ((item as any).NATUREZA || '').toLowerCase().includes('patrocínio')) {
        current.patrocinio += item.VALOR_REPASSE;
      } else {
        current.fomento += item.VALOR_REPASSE;
      }
      map.set(state, current);
    });
    return map;
  }, [selecionados, selectedCategoria]);

  const evolucaoData = useMemo(() => {
    if (theme !== 'history') return [];
    const fomento2025Total = appData.fomentoHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const fom2026Total = appData.fomento2026.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);
    const patrocinio2025Total = appData.patrocinioHistorico.reduce((acc, curr) => acc + curr.VALOR_REPASSE, 0);

    return [
      { name: '2025', Fomento: fomento2025Total, Patrocínio: patrocinio2025Total },
      { name: '2026', Fomento: fom2026Total, Patrocínio: 0 }
    ];
  }, [theme, appData]);

  const stateEntitiesCount = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const map = new Map<string, Set<string>>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      if (!map.has(state)) map.set(state, new Set());
      map.get(state)!.add(item.CNPJ || item.ENTIDADE);
    });
    const counts = new Map<string, number>();
    map.forEach((set, state) => counts.set(state, set.size));
    return counts;
  }, [selecionados, selectedCategoria]);

  const stateAdherenceData = useMemo(() => {
    const dataToUse = selectedCategoria 
      ? selecionados.filter(item => item.CATEGORIA === selectedCategoria)
      : selecionados;

    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

    const map = new Map<string, { totalHits: number, dimensionsSet: Set<string>, totalEntities: number }>();
    dataToUse.forEach(item => {
      const state = item.ESTADO || 'Indefinido';
      const current = map.get(state) || { totalHits: 0, dimensionsSet: new Set<string>(), totalEntities: 0 };
      current.totalEntities += 1;
      if (item.RANKING_ADERENCIA_INFRABR) {
        const dims = item.RANKING_ADERENCIA_INFRABR.split('|');
        current.totalHits += dims.length;
        dims.forEach(d => {
          const p = d.trim();
          const dashIndex = p.indexOf('-');
          const namePartRaw = dashIndex !== -1 ? p.substring(dashIndex + 1).trim() : p.trim();
          const namePartNorm = normalize(namePartRaw);
          if (namePartNorm) current.dimensionsSet.add(namePartNorm);
        });
      }
      map.set(state, current);
    });

    const result = new Map<string, { totalDimensions: number, totalHits: number, totalEntities: number }>();
    map.forEach((value, key) => {
      result.set(key, { 
        totalDimensions: value.dimensionsSet.size, 
        totalHits: value.totalHits, 
        totalEntities: value.totalEntities 
      });
    });
    return result;
  }, [selecionados, selectedCategoria]);

  const sortedStateData = useMemo(() => {
    return Array.from(stateData.entries()).sort((a,b) => b[1] - a[1]);
  }, [stateData]);

  const totalGlobalRepasse = useMemo(() => {
    return Array.from(stateData.values()).reduce((sum, val) => sum + val, 0);
  }, [stateData]);

  const maxStateValue = useMemo(() => {
    return Math.max(...Array.from(stateData.values()), 1);
  }, [stateData]);

  const stateColorScale = useMemo(() => {
    return scaleLinear<string>().domain([0, maxStateValue]).range([colorScaleStart, colorScaleEnd]);
  }, [maxStateValue, colorScaleStart, colorScaleEnd]);

  const getStateColor = (stateName: string) => {
    const value = stateData.get(stateName) || 0;
    if (value === 0) return "#fff0f0";
    return stateColorScale(value);
  };

  const infraChartData = useMemo(() => {
    if (!selectedState) {
      return infraData.mediasBR
        .filter(d => d.dimensao !== 'INFRA-BR')
        .map(d => ({
          name: d.dimensao,
          value: d.media_pais_pct,
          label: 'Média BR'
        }))
        .sort((a, b) => b.value - a.value);
    } else {
      const sigla = getStateSigla(selectedState);
      if (selectedInfraComponent) {
        return infraData.indicadores
          .filter(i => i.sigla_uf === sigla && i.component_name === selectedInfraComponent)
          .map(i => ({
            name: i.indicator_name,
            value: i.value,
            label: selectedState
          }))
          .sort((a, b) => b.value - a.value);
      }
      if (selectedInfraDimension) {
        return infraData.componentes
          .filter(c => c.sigla_uf === sigla && c.dimension_name === selectedInfraDimension)
          .map(c => ({
            name: c.component_name,
            value: c.value,
            label: selectedState
          }))
          .sort((a, b) => b.value - a.value);
      }
      return infraData.dimensoes
        .filter(d => d.sigla_uf === sigla)
        .map(d => ({
          name: d.dimension_name,
          value: d.value,
          label: selectedState
        }))
        .sort((a, b) => b.value - a.value);
    }
  }, [selectedState, selectedInfraDimension, selectedInfraComponent]);

  const grupoData = useMemo(() => {
    const dataToUse = selectedState
      ? selecionados.filter(item => item.ESTADO === selectedState)
      : selecionados;

    let cden = 0;
    let prec = 0;
    let fallback = 0;
    let cdenEntities = new Set<string>();
    let precEntities = new Set<string>();
    let fallbackEntities = new Set<string>();

    dataToUse.forEach(item => {
      const entityId = item.CNPJ || item.ENTIDADE;
      if (item.IsCDEN) {
        cden += item.VALOR_REPASSE;
        cdenEntities.add(entityId);
      } else if (item.IsPrecursora) {
        prec += item.VALOR_REPASSE;
        precEntities.add(entityId);
      } else {
        fallback += item.VALOR_REPASSE;
        fallbackEntities.add(entityId);
      }
    });

    const totalRepasse = cden + prec + fallback;

    return [
      { name: 'CDEN', value: cden, count: cdenEntities.size, total: totalRepasse, fill: '#1e40af' },
      { name: 'Precursoras', value: prec, count: precEntities.size, total: totalRepasse, fill: '#065f46' },
      { name: 'Outras', value: fallback, count: fallbackEntities.size, total: totalRepasse, fill: '#475569' }
    ].filter(d => d.value > 0);
  }, [selecionados, selectedState]);

  const infraBRAdherenceTotals = useMemo(() => {
    const counts: Record<string, number> = {};
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
    const cardDimensions = infraData.mediasBR.map(d => d.dimensao);

    filteredData.forEach(item => {
      if (item.RANKING_ADERENCIA_INFRABR) {
        const parts = item.RANKING_ADERENCIA_INFRABR.split('|').map(p => p.trim());
        parts.forEach(p => {
          const dashIndex = p.indexOf('-');
          const namePartRaw = dashIndex !== -1 ? p.substring(dashIndex + 1).trim() : p.trim();
          const namePartNorm = normalize(namePartRaw);
          
          if (namePartNorm) {
            cardDimensions.forEach(cardDimName => {
              const cardDimNorm = normalize(cardDimName);
              if (cardDimNorm.includes(namePartNorm) || namePartNorm.includes(cardDimNorm)) {
                counts[cardDimName] = (counts[cardDimName] || 0) + 1;
              }
            });
          }
        });
      }
    });
    return counts;
  }, [filteredData]);

  const cityMarkers = useMemo(() => {
    if (!selectedState) return [];
    const currentEntities = selecionados.filter(e => e.ESTADO === selectedState && (!e.tipoRepasse || e.tipoRepasse === 'Fomento'));
    const markers: { name: string, label: string, coords: [number, number], entities: any[] }[] = [];
    
    currentEntities.forEach(entity => {
      const city = getCityCoords(entity.ENTIDADE);
      if (city) {
        const existing = markers.find(m => m.name === city.name);
        if (existing) {
          existing.entities.push(entity);
        } else {
          markers.push({
            name: city.name,
            label: city.label,
            coords: [city.lng, city.lat],
            entities: [entity]
          });
        }
      }
    });
    return markers;
  }, [selecionados, selectedState]);

  const mapProjection = useMemo(() => {
    const width = 800;
    const height = 500;
    const projection = geoMercator();
    if (!geoData) {
      return projection.scale(750).center([-54, -15]);
    }
    
    if (selectedState) {
      const feature = geoData.features.find((f: any) => f.properties.name === selectedState);
      if (feature) {
        const padding = 20;
        return projection.fitExtent([[padding, padding], [width - padding, height - padding]], feature);
      }
    }
    
    return projection.fitSize([width, height], geoData);
  }, [geoData, selectedState]);

  const getComponentsForDimension = (dimensionName: string) => {
    if (!selectedState) return [];
    const sigla = getStateSigla(selectedState);
    return infraData.componentes
      .filter(c => c.sigla_uf === sigla && c.dimension_name === dimensionName)
      .map(c => ({ name: c.component_name, value: c.value }));
  };

  const getIndicatorsForComponent = (componentName: string) => {
    if (!selectedState) return [];
    const sigla = getStateSigla(selectedState);
    return infraData.indicadores
      .filter(i => i.sigla_uf === sigla && i.component_name === componentName)
      .map(i => ({ name: i.indicator_name, value: i.value }));
  };

  const getIndicatorDetails = (indicatorName: string) => {
    return infraData.detalhamento.find(d => d.INDICADOR.trim().toLowerCase() === indicatorName.trim().toLowerCase() || d.ID === indicatorName);
  };

  return {
    state: {
      selectedState, setSelectedState,
      selectedCategoria, setSelectedCategoria,
      selectedInfraDimension, setSelectedInfraDimension,
      selectedInfraComponent, setSelectedInfraComponent,
      mapTooltip, setMapTooltip,
      geoData, setGeoData
    },
    metrics: {
      filteredData, kpis, regionData, stateData, stateBreakdownData, evolucaoData,
      stateEntitiesCount, stateAdherenceData, sortedStateData, totalGlobalRepasse,
      maxStateValue, stateColorScale, getStateColor, infraChartData, grupoData,
      infraBRAdherenceTotals, cityMarkers, mapProjection
    },
    helpers: {
      clearFilters, getComponentsForDimension, getIndicatorsForComponent, getIndicatorDetails
    }
  };
}
