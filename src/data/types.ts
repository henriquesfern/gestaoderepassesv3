export interface RawFomento2025Row {
  CNPJ?: string;
  Estado?: string;
  ESTADO?: string;
  Sigla?: string;
  Valor?: string | number;
  Classificação?: string | number;
  FISCAL?: string;
  [key: string]: any;
}

export interface RawFomento2026Row {
  CNPJ?: string;
  ENTIDADE?: string;
  OBJETIVO?: string;
  OBJETIVO_ESTRATEGICO?: string;
  CATEGORIA?: string;
  ESTADO?: string;
  SIGLA_UF?: string;
  MÉDIA?: string | number;
  VOTOS?: string | number;
  VALOR_CONCEDENTEAJUSTADO?: string | number;
  CONTROLEORÇAMENTO?: string | number;
  VALORPROJETO?: string | number;
  CONTROLEPROJETO?: string | number;
  AJUSTEVALORCONCEDENTE?: string;
  TIPOENTIDADE?: string;
  REGIÃO?: string;
  FISCAL?: string;
  SEI?: string;
  OBJETIVO_COMPLETO?: string;
  AREA_ABRANGENCIA?: string;
  OBJETIVO_ESPECIFICO?: string;
  PUBLICO_ALVO?: string;
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
  [key: string]: any;
}

export interface RawPatrocinio2025Row {
  Entidade?: string;
  CNPJ?: string;
  Estado?: string;
  Tipo?: string;
  TipoPublicacao?: string;
  Projeto?: string;
  Pontuação?: string | number;
  'Valor de Repasse'?: string | number;
  Fiscal?: string;
  'Fiscal Suplente'?: string;
  SEI?: string;
  'Data Início'?: string;
  'Data Fim'?: string;
  Mês?: string;
  [key: string]: any;
}

export interface GestaoFomento26Row {
  cnpj: string;
  inicioexecucao?: string;
  fimexecucao?: string;
  termodefomento?: string;
  status?: string;
  primeirorepasse?: string;
  dataprimeirorepasse?: string;
  segundorepasse?: string;
  datasegundorepasse?: string;
  fiscalsuplente?: string;
  situacaofinal?: string;
}