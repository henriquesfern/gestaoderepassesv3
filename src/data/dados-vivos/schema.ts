import { z } from 'zod';

const textoObrigatorioSchema = z.string().trim().min(1);
const textoOpcionalSchema = z.string().trim().min(1).optional();

export const cnpjNormalizadoDadosVivosSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ normalizado deve conter 14 digitos.');

export const tipoProjetoDadosVivosSchema = z.enum(['fomento', 'patrocinio']);
export const fonteProjetoDadosVivosSchema = z.enum(['fomento2026', 'fomento2025', 'patrocinio2025']);
export const fonteAcompanhamentoDadosVivosSchema = z.enum(['gestaofomento26']);
export const fonteClassificacaoInfraBRProjetoDadosVivosSchema = z.enum(['fomento2026']);
export const nivelClassificacaoInfraBRProjetoDadosVivosSchema = z.enum(['dimensao', 'componente', 'indicador']);

export const entidadeDadosVivosSchema = z.object({
  entidade_id: textoObrigatorioSchema,
  cnpj_normalizado: cnpjNormalizadoDadosVivosSchema,
  nome_atual: textoObrigatorioSchema,
  sigla: textoOpcionalSchema,
  uf: textoOpcionalSchema,
  estado: textoOpcionalSchema,
  cidade: textoOpcionalSchema,
  is_cden: z.boolean(),
  is_precursora: z.boolean(),
  fontes: z.array(textoObrigatorioSchema).min(1),
});

export const projetoBaseDadosVivosSchema = z.object({
  projeto_id: textoObrigatorioSchema,
  tipo_projeto: tipoProjetoDadosVivosSchema,
  ciclo: textoObrigatorioSchema,
  cnpj_entidade: cnpjNormalizadoDadosVivosSchema,
  nome_entidade_snapshot: textoObrigatorioSchema,
  sigla_snapshot: textoOpcionalSchema,
  uf_snapshot: textoOpcionalSchema,
  estado_snapshot: textoOpcionalSchema,
  cidade_snapshot: textoOpcionalSchema,
  sei: textoOpcionalSchema,
  titulo_ou_objeto_resumido: textoOpcionalSchema,
  valor_repasse: z.number().finite().min(0),
  valor_projeto: z.number().finite().min(0).optional(),
  nota: z.number().finite().min(0).optional(),
  fiscal: textoOpcionalSchema,
  fiscal_suplente: textoOpcionalSchema,
  data_inicio_prevista: textoOpcionalSchema,
  data_fim_prevista: textoOpcionalSchema,
  status_geral: textoOpcionalSchema,
  fonte_arquivo: fonteProjetoDadosVivosSchema,
});

export const projetoFomentoDadosVivosSchema = z.object({
  projeto_id: textoObrigatorioSchema,
  objetivo_estrategico: textoOpcionalSchema,
  objetivo_especifico: textoOpcionalSchema,
  objetivo_completo: textoOpcionalSchema,
  area_abrangencia: textoOpcionalSchema,
  publico_alvo: textoOpcionalSchema,
  texto_norm: textoOpcionalSchema,
  linha_solicitada: textoOpcionalSchema,
  resultado_classificacao: textoOpcionalSchema,
  ranking_aderencia_infrabr: textoOpcionalSchema,
  scores_dimensoes: textoOpcionalSchema,
  dimensao_principal: textoOpcionalSchema,
  termos_detectados: textoOpcionalSchema,
});

export const projetoPatrocinioDadosVivosSchema = z.object({
  projeto_id: textoObrigatorioSchema,
  tipo_patrocinio: textoOpcionalSchema,
  tipo_publicacao: textoOpcionalSchema,
  mes: textoOpcionalSchema,
  evento_ou_projeto: textoOpcionalSchema,
  cidade_realizacao: textoOpcionalSchema,
  local_realizacao: textoOpcionalSchema,
  fiscal_crea: textoOpcionalSchema,
});

export const acompanhamentoProjetoDadosVivosSchema = z.object({
  acompanhamento_id: textoObrigatorioSchema,
  projeto_id: textoObrigatorioSchema,
  cnpj_entidade: cnpjNormalizadoDadosVivosSchema,
  status_execucao: textoOpcionalSchema,
  inicio_execucao: textoOpcionalSchema,
  fim_execucao: textoOpcionalSchema,
  termo: textoOpcionalSchema,
  valor_primeiro_repasse: z.number().finite().min(0).optional(),
  data_primeiro_repasse: textoOpcionalSchema,
  valor_segundo_repasse: z.number().finite().min(0).optional(),
  data_segundo_repasse: textoOpcionalSchema,
  fiscal_suplente: textoOpcionalSchema,
  situacao_final: textoOpcionalSchema,
  fonte_arquivo: fonteAcompanhamentoDadosVivosSchema,
});

export const classificacaoInfraBRProjetoDadosVivosSchema = z.object({
  classificacao_id: textoObrigatorioSchema,
  projeto_id: textoObrigatorioSchema,
  nivel: nivelClassificacaoInfraBRProjetoDadosVivosSchema,
  dimensao: textoOpcionalSchema,
  componente: textoOpcionalSchema,
  indicador: textoOpcionalSchema,
  ordem_ranking: z.number().int().positive().optional(),
  score: z.number().finite().min(0).optional(),
  is_dimensao_principal: z.boolean(),
  termos_detectados: textoOpcionalSchema,
  termos_componentes: textoOpcionalSchema,
  termos_indicadores: textoOpcionalSchema,
  ranking_original: textoOpcionalSchema,
  scores_original: textoOpcionalSchema,
  fonte_arquivo: fonteClassificacaoInfraBRProjetoDadosVivosSchema,
});

export const alertaDadosVivosSchema = z.object({
  nivel: z.enum(['aviso', 'erro']),
  codigo: textoObrigatorioSchema,
  mensagem: textoObrigatorioSchema,
  referencia: textoOpcionalSchema,
});

export const modeloDadosVivosParaleloSchema = z.object({
  entidades: z.array(entidadeDadosVivosSchema),
  projetos_base: z.array(projetoBaseDadosVivosSchema),
  projetos_fomento: z.array(projetoFomentoDadosVivosSchema),
  projetos_patrocinio: z.array(projetoPatrocinioDadosVivosSchema),
  acompanhamento_projetos: z.array(acompanhamentoProjetoDadosVivosSchema),
  classificacoes_infrabr_projeto: z.array(classificacaoInfraBRProjetoDadosVivosSchema),
  alertas: z.array(alertaDadosVivosSchema),
});
