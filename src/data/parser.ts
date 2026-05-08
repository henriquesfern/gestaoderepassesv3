import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { fomento2025CSV } from './fomento2025';
import { fomento2026CSV } from './fomento2026';
import { patrocinioCSV } from './patrocinio2025';
import { getRegionByState, getStateFullName } from './regions';
import { infraData } from './infraBR_parser';
import { newFomentoCSV } from './newFomentoData';

export interface EntidadeCDEN {
  Entidade: string;
  CNPJ: string;
}

export interface EntidadePrecursora {
  CNPJ: string;
  Entidade: string;
  Sigla: string;
  Crea: string;
  Fundação: string;
}



export interface EntidadeSelecionada {
  ENTIDADE: string;
  CNPJ: string;
  OBJETIVO: string;
  CATEGORIA: string;
  ESTADO: string;
  NOTA: number;
  VOTOS: number;
  VALOR_REPASSE: number;
  CONTROLE_ORCAMENTO?: number;
  VALOR_PROJETO?: number;
  CONTROLE_PROJETO?: number;
  AJUSTE_VALOR_CONCEDENTE?: string;
  TIPOENTIDADE?: string;
  REGIÃO: string;
  FISCAL: string;
  FISCAL_SUPLENTE: string;
  SEI: string;
  IsCDEN: boolean;
  IsPrecursora: boolean;
  tipoRepasse: 'Fomento' | 'Patrocínio';
  DATA_INICIO?: string;
  DATA_FIM?: string;
  MES?: string;
  OBJETIVO_COMPLETO?: string;
  AREA_ABRANGENCIA?: string;
  OBJETIVO_ESPECIFICO_COMPLETO?: string;
  PUBLICO_ALVO?: string;
  OBJETIVO_ESTRATEGICO?: string;
  TEXTO_NORM?: string;
  RANKING_ADERENCIA_INFRABR?: string;
  SCORES?: string;
  DIMENSAO_PRINCIPAL?: string;
  TERMOS_DETECTADOS?: string;
  DIMENSAO_1?: string;
  DIMENSAO_2?: string;
  DIMENSAO_3?: string;
  DIMENSAO_4?: string;
  DIMENSAO_5?: string;
  RANKING_COMPONENTES?: string;
  SCORES_COMPONENTES?: string;
  RANKING_INDICADORES?: string;
  SCORES_INDICADORES?: string;
  TERMOS_COMPONENTES?: string;
  TERMOS_INDICADORES?: string;
  COMPONENTE_1?: string;
  COMPONENTE_2?: string;
  COMPONENTE_3?: string;
  COMPONENTE_4?: string;
  COMPONENTE_5?: string;
  COMPONENTE_6?: string;
  COMPONENTE_7?: string;
  INDICADOR_1?: string;
  INDICADOR_2?: string;
  INDICADOR_3?: string;
  INDICADOR_4?: string;
  INDICADOR_5?: string;
  INDICADOR_6?: string;
  INDICADOR_7?: string;
  INDICADOR_8?: string;
  INDICADOR_9?: string;
}

// Utility to parse brazilian currency
const parseCurrency = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace(/R[\\\$\s]*/g, '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned) || 0;
};

// Utility to parse brazilian numbers (e.g. 11,43)
const parseNumberBR = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(',', '.')) || 0;
};

// --- ADAPTADORES (Mapeamento Seguro por Versão) ---

/**
 * Adapter para Fomento 2025 (Histórico)
 */
const adaptFomento2025 = (row: any, cdenParsed: any[], precursorasParsed: any[]): EntidadeSelecionada => {
  const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
  const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
  
  const getField = (prefix: string) => {
    const key = Object.keys(row).find(k => k.trim().startsWith(prefix));
    return key ? row[key] : '';
  };

  let linhaSolicitada = getField('Linha');
  if (linhaSolicitada === '1') linhaSolicitada = 'Atividade principal do Sistema Confea/Crea';
  else if (linhaSolicitada === '2') linhaSolicitada = 'Transparência, Legalidade e Legitimidade do Sistema Confea/Crea';
  else if (linhaSolicitada === '3') linhaSolicitada = 'Papel do Sistema Confea/Crea';
  else linhaSolicitada = 'Outros';

  const razaoSocial = getField('Razão Social') || row.Sigla || '';

  return {
    ENTIDADE: razaoSocial,
    CNPJ: row.CNPJ || '',
    OBJETIVO: linhaSolicitada,
    CATEGORIA: linhaSolicitada,
    ESTADO: getStateFullName(row.Estado || row.ESTADO || ''),
    NOTA: parseNumberBR(row['Classificação']) || 0,
    VOTOS: 0,
    VALOR_REPASSE: parseCurrency(row.Valor),
    CONTROLE_ORCAMENTO: 0,
    VALOR_PROJETO: parseCurrency(row.Valor),
    CONTROLE_PROJETO: 0,
    AJUSTE_VALOR_CONCEDENTE: '',
    TIPOENTIDADE: '',
    REGIÃO: getRegionByState(row.Estado || row.ESTADO || ''),
    FISCAL: row.FISCAL || '',
    FISCAL_SUPLENTE: '',
    SEI: getField('Processo SEI') || getField('ProcessoSEI') || '',
    IsCDEN: isCDEN,
    IsPrecursora: isPrecursora,
    tipoRepasse: 'Fomento' as const,
    DATA_INICIO: getField('DATA INÍCIO') || '',
    DATA_FIM: getField('DATA FIM') || '',
    MES: ''
  };
};

/**
 * Adapter para Fomento 2026 (Corrente)
 */
const adaptFomento2026 = (row: any, cdenParsed: any[], precursorasParsed: any[], newFomentoMap?: Map<string, any>): EntidadeSelecionada => {
  const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
  const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
  const newRow = newFomentoMap ? newFomentoMap.get(row.CNPJ) : null;
  const targetRow = newRow || row;
  
  return {
    ENTIDADE: row.ENTIDADE || '',
    CNPJ: row.CNPJ || '',
    OBJETIVO: row.OBJETIVO_ESTRATEGICO || row.OBJETIVO || '',
    CATEGORIA: row.OBJETIVO_ESTRATEGICO || row.CATEGORIA || row.OBJETIVO || '',
    ESTADO: getStateFullName(row.ESTADO || row.SIGLA_UF || ''),
    NOTA: parseNumberBR(row['MÉDIA']) || 0,
    VOTOS: parseInt(row['VOTOS'], 10) || 0,
    VALOR_REPASSE: parseCurrency(row['VALOR_CONCEDENTEAJUSTADO']),
    CONTROLE_ORCAMENTO: parseCurrency(row['CONTROLEORÇAMENTO']),
    VALOR_PROJETO: parseCurrency(row['VALORPROJETO']),
    CONTROLE_PROJETO: parseCurrency(row['CONTROLEPROJETO']),
    AJUSTE_VALOR_CONCEDENTE: row['AJUSTEVALORCONCEDENTE'] || '',
    TIPOENTIDADE: row.TIPOENTIDADE === '#ERROR!' ? 'Desconhecido' : row.TIPOENTIDADE,
    REGIÃO: row['REGIÃO'] || getRegionByState(row.ESTADO || row.SIGLA_UF || ''),
    FISCAL: row.FISCAL || '',
    FISCAL_SUPLENTE: '',
    SEI: row.SEI || '',
    IsCDEN: isCDEN,
    IsPrecursora: isPrecursora,
    tipoRepasse: 'Fomento' as const,
    OBJETIVO_COMPLETO: row.OBJETIVO_COMPLETO || '',
    AREA_ABRANGENCIA: row.AREA_ABRANGENCIA || '',
    OBJETIVO_ESPECIFICO_COMPLETO: row.OBJETIVO_ESPECIFICO || '',
    PUBLICO_ALVO: row.PUBLICO_ALVO || '',
    OBJETIVO_ESTRATEGICO: row.OBJETIVO_ESTRATEGICO || '',
    TEXTO_NORM: row.TEXTO_NORM || '',
    RANKING_ADERENCIA_INFRABR: targetRow.Ranking_Aderencia_InfraBR_M3_3_VALIDADO || row.RANKING_ADERENCIA_INFRABR || '',
    SCORES: targetRow.Scores_Dimensoes_M3_3_VALIDADO || row.SCORES || '',
    DIMENSAO_PRINCIPAL: row.DIMENSAO_PRINCIPAL || '',
    TERMOS_DETECTADOS: targetRow.Termos_Detectados_M3_3_VALIDADO || row.TERMOS_DETECTADOS || '',
    DIMENSAO_1: targetRow.Dimensao_1_M3_3_VALIDADO || row.DIMENSAO_1 || '',
    DIMENSAO_2: targetRow.Dimensao_2_M3_3_VALIDADO || row.DIMENSAO_2 || '',
    DIMENSAO_3: targetRow.Dimensao_3_M3_3_VALIDADO || row.DIMENSAO_3 || '',
    DIMENSAO_4: targetRow.Dimensao_4_M3_3_VALIDADO || row.DIMENSAO_4 || '',
    DIMENSAO_5: targetRow.Dimensao_5_M3_3_VALIDADO || row.DIMENSAO_5 || '',
    RANKING_COMPONENTES: targetRow.Ranking_Componentes_M3_3_VALIDADO || '',
    SCORES_COMPONENTES: targetRow.Scores_Componentes_M3_3_VALIDADO || '',
    RANKING_INDICADORES: targetRow.Ranking_Indicadores_M3_3_VALIDADO || '',
    SCORES_INDICADORES: targetRow.Scores_Indicadores_M3_3_VALIDADO || '',
    TERMOS_COMPONENTES: targetRow.Termos_Componentes_M3_3_VALIDADO || '',
    TERMOS_INDICADORES: targetRow.Termos_Indicadores_M3_3_VALIDADO || '',
    COMPONENTE_1: targetRow.Componente_1_M3_3_VALIDADO || '',
    COMPONENTE_2: targetRow.Componente_2_M3_3_VALIDADO || '',
    COMPONENTE_3: targetRow.Componente_3_M3_3_VALIDADO || '',
    COMPONENTE_4: targetRow.Componente_4_M3_3_VALIDADO || '',
    COMPONENTE_5: targetRow.Componente_5_M3_3_VALIDADO || '',
    COMPONENTE_6: targetRow.Componente_6_M3_3_VALIDADO || '',
    COMPONENTE_7: targetRow.Componente_7_M3_3_VALIDADO || '',
    INDICADOR_1: targetRow.Indicador_1_M3_3_VALIDADO || '',
    INDICADOR_2: targetRow.Indicador_2_M3_3_VALIDADO || '',
    INDICADOR_3: targetRow.Indicador_3_M3_3_VALIDADO || '',
    INDICADOR_4: targetRow.Indicador_4_M3_3_VALIDADO || '',
    INDICADOR_5: targetRow.Indicador_5_M3_3_VALIDADO || '',
    INDICADOR_6: targetRow.Indicador_6_M3_3_VALIDADO || '',
    INDICADOR_7: targetRow.Indicador_7_M3_3_VALIDADO || '',
    INDICADOR_8: targetRow.Indicador_8_M3_3_VALIDADO || '',
    INDICADOR_9: targetRow.Indicador_9_M3_3_VALIDADO || ''
  };
};

/**
 * Adapter para Patrocínio 2025
 */
const adaptPatrocinio2025 = (row: any, cdenParsed: any[], precursorasParsed: any[]): EntidadeSelecionada => {
  const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
  const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
  
  const tipo = row['Tipo'] || '';
  const tipoPub = row['TipoPublicacao'] || '';
  const categoria = tipo === 'PUBLICAÇÃO' && tipoPub ? (tipoPub.charAt(0).toUpperCase() + tipoPub.slice(1).toLowerCase()) : (tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase());
  const projetoFull = row['Projeto'] || '';
  const objetivoTruncated = projetoFull.length > 35 ? projetoFull.substring(0, 35) + '...' : projetoFull;

  return {
    ENTIDADE: row.Entidade,
    CNPJ: row.CNPJ,
    OBJETIVO: objetivoTruncated || categoria,
    CATEGORIA: categoria,
    ESTADO: getStateFullName(row.Estado || ''),
    NOTA: parseNumberBR(row['Pontuação']),
    VOTOS: 0,
    VALOR_REPASSE: parseCurrency(row['Valor de Repasse']),
    REGIÃO: getRegionByState(row.Estado),
    FISCAL: row.Fiscal || '',
    FISCAL_SUPLENTE: row['Fiscal Suplente'] || '',
    SEI: row.SEI || '',
    IsCDEN: isCDEN,
    IsPrecursora: isPrecursora,
    tipoRepasse: 'Patrocínio' as const,
    DATA_INICIO: row['Data Início'] || '',
    DATA_FIM: row['Data Fim'] || '',
    MES: row['Mês'] || ''
  };
};

export const parseData = () => {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomentoRaw = Papa.parse<any>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<any>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<any>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true }).data;
  
  const newFomentoRaw = Papa.parse<any>(newFomentoCSV.trim(), { header: true, skipEmptyLines: true, delimiter: ';' }).data;
  const newFomentoMap = new Map(newFomentoRaw.map((r: any) => [r.CNPJ, r]));

  // 2. Processamento via Adapters (Camada de Tradução)
  const fomentoHistoricoParsed = fomentoRaw.map(row => adaptFomento2025(row, cdenParsed, precursorasParsed));
  const fomento2026Parsed = fomento2026Raw.map(row => adaptFomento2026(row, cdenParsed, precursorasParsed, newFomentoMap));
  const patrocinioParsed = patrocinioRaw.map(row => adaptPatrocinio2025(row, cdenParsed, precursorasParsed));

  // 3. Retorno da Fonte da Verdade Consolidada
  return {
    cden: cdenParsed,
    precursoras: precursorasParsed,
    fomento2026: fomento2026Parsed,
    fomentoHistorico: fomentoHistoricoParsed,
    patrocinioHistorico: patrocinioParsed,
    infraBR: infraData
  };
};

export const appData = parseData();
