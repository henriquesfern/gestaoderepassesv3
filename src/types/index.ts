export * from './infra';

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
  gestao_inicioexecucao?: string;
  gestao_fimexecucao?: string;
  gestao_termodefomento?: string;
  gestao_status?: string;
  gestao_primeirorepasse?: string;
  gestao_dataprimeirorepasse?: string;
  gestao_segundorepasse?: string;
  gestao_datasegundorepasse?: string;
  gestao_fiscalsuplente?: string;
  gestao_situacaofinal?: string;
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
