export type ProgramaTipo = 'fomento' | 'patrocinio';

export type FonteDadosClassificacao = 'fonte' | 'espelho' | 'derivado' | 'legado';

export type UnidadeFederativa =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

export interface EntidadeCanonica {
  entidade_id: string;
  nome_entidade: string;
  cnpj?: string;
  sigla?: string;
  tipo_entidade?: string;
  vinculo_cden?: boolean;
  vinculo_precursora?: boolean;
}

export interface ProjetoCanonico {
  projeto_id: string;
  entidade_id: string;
  programa: ProgramaTipo;
  ano: number;
  uf?: UnidadeFederativa;
  estado?: string;
  regiao?: string;
  sei?: string;
  objetivo?: string;
  categoria?: string;
  nota?: number;
  objetivo_completo?: string;
  area_abrangencia?: string;
  objetivo_especifico?: string;
  publico_alvo?: string;
  objetivo_estrategico?: string;
  texto_normalizado?: string;
  termo_fomento?: string;
  status_execucao?: string;
}

export interface RepasseCanonico {
  repasse_id: string;
  projeto_id: string;
  entidade_id: string;
  programa: ProgramaTipo;
  ano: number;
  valor_repasse: number;
  valor_projeto?: number;
  controle_orcamento?: string;
  controle_projeto?: string;
  fiscal?: string;
  fiscal_suplente?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface ProgramaCanonico {
  programa_id: string;
  programa: ProgramaTipo;
  ano: number;
  descricao?: string;
  fonte_dados_id?: string;
}

export interface EstadoCanonico {
  uf: UnidadeFederativa;
  estado: string;
  regiao?: string;
  estado_id?: string;
}

export interface FonteDadosCanonica {
  fonte_dados_id: string;
  caminho: string;
  dominio: string;
  classificacao: FonteDadosClassificacao;
  descricao?: string;
  atualizado_em?: string;
}

export interface InfraEstadoCanonico {
  uf: UnidadeFederativa;
  estado_id?: string;
  infra_br: number;
  ranking?: number;
  cor_classe?: string;
}

export interface InfraDimensaoCanonica {
  dimensao_id: string;
  nome_dimensao: string;
  descricao?: string;
}

export interface InfraValorDimensaoCanonico {
  valor_dimensao_id: string;
  dimensao_id: string;
  uf: UnidadeFederativa;
  estado_id?: string;
  valor: number;
  ranking?: number;
  cor_classe?: string;
}

export interface InfraComponenteCanonico {
  componente_id: string;
  dimensao_id: string;
  nome_componente: string;
  descricao?: string;
}

export interface InfraIndicadorCanonico {
  indicador_id: string;
  componente_id: string;
  nome_indicador: string;
  ano?: number;
  indicador_negativado?: boolean;
  descricao?: string;
  fonte?: string;
  unidade?: string;
  interpretacao?: string;
}

export interface InfraDetalheIndicadorCanonico {
  detalhe_indicador_id: string;
  indicador_id: string;
  uf: UnidadeFederativa;
  valor: number;
  ranking?: number;
  cor_classe?: string;
}

export interface AderenciaInfraCanonica {
  aderencia_id: string;
  projeto_id: string;
  dimensao_id?: string;
  componente_id?: string;
  indicador_id?: string;
  score?: number;
  ranking?: number;
  termos_detectados?: string[];
}

export interface ModeloCanonicoDados {
  entidades: EntidadeCanonica[];
  projetos: ProjetoCanonico[];
  repasses: RepasseCanonico[];
  programas: ProgramaCanonico[];
  estados: EstadoCanonico[];
  fontes_dados: FonteDadosCanonica[];
  infra_estados: InfraEstadoCanonico[];
  infra_dimensoes: InfraDimensaoCanonica[];
  infra_valores_dimensoes: InfraValorDimensaoCanonico[];
  infra_componentes: InfraComponenteCanonico[];
  infra_indicadores: InfraIndicadorCanonico[];
  infra_detalhes_indicadores: InfraDetalheIndicadorCanonico[];
  aderencias_infra: AderenciaInfraCanonica[];
}
