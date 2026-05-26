export type TipoProjetoDadosVivos = 'fomento' | 'patrocinio';

export type FonteProjetoDadosVivos =
  | 'fomento2026'
  | 'fomento2025'
  | 'patrocinio2025';

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

export interface AlertaDadosVivos {
  nivel: 'aviso' | 'erro';
  codigo: string;
  mensagem: string;
  referencia?: string;
}

export interface ModeloDadosVivosParalelo {
  entidades: EntidadeDadosVivos[];
  projetos_base: ProjetoBaseDadosVivos[];
  alertas: AlertaDadosVivos[];
}
