import { EntidadeSelecionada } from '../types';
import { parseCurrency, parseNumberBR } from '../utils/formatters';
import { getRegionByState } from './regions';

/**
 * Adapter para Fomento 2025 (Histórico)
 */
export const adaptFomento2025 = (row: any, cdenParsed: any[], precursorasParsed: any[]): EntidadeSelecionada => {
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
    CNPJ: row.CNPJ,
    OBJETIVO: linhaSolicitada,
    CATEGORIA: linhaSolicitada,
    ESTADO: row.Estado || row.ESTADO || '',
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
export const adaptFomento2026 = (row: any, cdenParsed: any[], precursorasParsed: any[], newFomentoMap?: Map<string, any>): EntidadeSelecionada => {
  const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
  const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
  const newRow = newFomentoMap ? newFomentoMap.get(row.CNPJ) : null;
  const targetRow = newRow || row;
  
  return {
    ENTIDADE: row.ENTIDADE || '',
    CNPJ: row.CNPJ || '',
    OBJETIVO: row.OBJETIVO_ESTRATEGICO || row.OBJETIVO || '',
    CATEGORIA: row.OBJETIVO_ESTRATEGICO || row.CATEGORIA || row.OBJETIVO || '',
    ESTADO: row.ESTADO || row.SIGLA_UF || '',
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
export const adaptPatrocinio2025 = (row: any, cdenParsed: any[], precursorasParsed: any[]): EntidadeSelecionada => {
  const isCDEN = cdenParsed.some(cden => cden.CNPJ === row.CNPJ);
  const isPrecursora = precursorasParsed.some(prec => prec.CNPJ === row.CNPJ);
  
  const tipo = row['Tipo'] || '';
  const tipoPub = row['TipoPublicacao'] || '';
  const categoria = tipo === 'PUBLICAÇÃO' && tipoPub ? (tipoPub.charAt(0).toUpperCase() + tipoPub.slice(1).toLowerCase()) : (tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase());
  const projetoFull = row['Projeto'] || '';
  const objetivoTruncated = projetoFull.length > 35 ? projetoFull.substring(0, 35) + '...' : projetoFull;

  return {
    ENTIDADE: row.Entidade || '',
    CNPJ: row.CNPJ || '',
    OBJETIVO: objetivoTruncated || categoria,
    CATEGORIA: categoria,
    ESTADO: row.Estado || '',
    NOTA: parseNumberBR(row['Pontuação']),
    VOTOS: 0,
    VALOR_REPASSE: parseCurrency(row['Valor de Repasse']),
    CONTROLE_ORCAMENTO: 0,
    VALOR_PROJETO: 0,
    CONTROLE_PROJETO: 0,
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
