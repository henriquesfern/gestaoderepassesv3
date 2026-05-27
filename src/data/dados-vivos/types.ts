export type TipoProjetoDadosVivos = 'fomento' | 'patrocinio';

export type FonteProjetoDadosVivos =
  | 'fomento2026'
  | 'fomento2025'
  | 'patrocinio2025';

export type FonteAcompanhamentoDadosVivos = 'gestaofomento26';

export type FonteClassificacaoInfraBRProjetoDadosVivos = 'fomento2026';

export type NivelClassificacaoInfraBRProjetoDadosVivos =
  | 'dimensao'
  | 'componente'
  | 'indicador';

export interface EntidadeDadosVivos {
  entidade_id: string;
  cnpj_normalizado: string;
  nome_atual: string;
  sigla?: string;
  uf?: string;
  estado?: string;
  cidade?: string;
  is_cden: boolean;
  is_precursora: boolean;
  fontes: string[];
}

export interface ProjetoBaseDadosVivos {
  projeto_id: string;
  tipo_projeto: TipoProjetoDadosVivos;
  ciclo: string;
  cnpj_entidade: string;
  nome_entidade_snapshot: string;
  sigla_snapshot?: string;
  uf_snapshot?: string;
  estado_snapshot?: string;
  cidade_snapshot?: string;
  sei?: string;
  titulo_ou_objeto_resumido?: string;
  valor_repasse: number;
  valor_projeto?: number;
  nota?: number;
  fiscal?: string;
  fiscal_suplente?: string;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  status_geral?: string;
  fonte_arquivo: FonteProjetoDadosVivos;
}

export interface ProjetoFomentoDadosVivos {
  projeto_id: string;
  votos?: number;
  controle_orcamento?: number;
  controle_projeto?: number;
  objetivo_estrategico?: string;
  objetivo_especifico?: string;
  objetivo_completo?: string;
  area_abrangencia?: string;
  publico_alvo?: string;
  texto_norm?: string;
  linha_solicitada?: string;
  resultado_classificacao?: string;
  ranking_aderencia_infrabr?: string;
  scores_dimensoes?: string;
  dimensao_principal?: string;
  termos_detectados?: string;
}

export interface ProjetoPatrocinioDadosVivos {
  projeto_id: string;
  tipo_patrocinio?: string;
  tipo_publicacao?: string;
  mes?: string;
  evento_ou_projeto?: string;
  cidade_realizacao?: string;
  local_realizacao?: string;
  fiscal_crea?: string;
}

export interface AcompanhamentoProjetoDadosVivos {
  acompanhamento_id: string;
  projeto_id: string;
  cnpj_entidade: string;
  status_execucao?: string;
  inicio_execucao?: string;
  fim_execucao?: string;
  termo?: string;
  valor_primeiro_repasse?: number;
  data_primeiro_repasse?: string;
  valor_segundo_repasse?: number;
  data_segundo_repasse?: string;
  fiscal_suplente?: string;
  situacao_final?: string;
  fonte_arquivo: FonteAcompanhamentoDadosVivos;
}

export interface ClassificacaoInfraBRProjetoDadosVivos {
  classificacao_id: string;
  projeto_id: string;
  nivel: NivelClassificacaoInfraBRProjetoDadosVivos;
  dimensao?: string;
  componente?: string;
  indicador?: string;
  ordem_ranking?: number;
  score?: number;
  is_dimensao_principal: boolean;
  termos_detectados?: string;
  termos_componentes?: string;
  termos_indicadores?: string;
  ranking_original?: string;
  scores_original?: string;
  fonte_arquivo: FonteClassificacaoInfraBRProjetoDadosVivos;
}

export interface AlertaDadosVivos {
  nivel: 'aviso' | 'erro';
  codigo: string;
  mensagem: string;
  referencia?: string;
}

export interface ModeloDadosVivosParalelo {
  entidades: EntidadeDadosVivos[];
  projetos_base: ProjetoBaseDadosVivos[];
  projetos_fomento: ProjetoFomentoDadosVivos[];
  projetos_patrocinio: ProjetoPatrocinioDadosVivos[];
  acompanhamento_projetos: AcompanhamentoProjetoDadosVivos[];
  classificacoes_infrabr_projeto: ClassificacaoInfraBRProjetoDadosVivos[];
  alertas: AlertaDadosVivos[];
}
