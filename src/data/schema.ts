import { z } from 'zod';

export const entidadeSelecionadaSchema = z.object({
  ENTIDADE: z.string().min(2, "Nome da entidade muito curto"),
  CNPJ: z.string().optional(),
  OBJETIVO: z.string(),
  CATEGORIA: z.string(),
  ESTADO: z.string(),
  NOTA: z.number().min(0).max(100),
  VOTOS: z.number().min(0),
  VALOR_REPASSE: z.number().min(0),
  CONTROLE_ORCAMENTO: z.number().optional(),
  VALOR_PROJETO: z.number().optional(),
  CONTROLE_PROJETO: z.number().optional(),
  AJUSTE_VALOR_CONCEDENTE: z.string().optional(),
  TIPOENTIDADE: z.string().optional(),
  REGIÃO: z.string(),
  FISCAL: z.string().optional(),
  FISCAL_SUPLENTE: z.string().optional(),
  SEI: z.string(),
  IsCDEN: z.boolean(),
  IsPrecursora: z.boolean(),
  tipoRepasse: z.enum(['Fomento', 'Patrocínio']),
}).passthrough();

export const fomento2026ListSchema = z.array(entidadeSelecionadaSchema);
export const fomentoHistoricoListSchema = z.array(entidadeSelecionadaSchema);
export const patrocinioHistoricoListSchema = z.array(entidadeSelecionadaSchema);

export const indicadorPilarSchema = z.object({
  value: z.union([z.number(), z.string()]),
  rank: z.number(),
  color: z.number(),
  sigla_uf: z.string(),
  state_id: z.number(),
  indicator_id: z.string(),
  component_id: z.string(),
  component_name: z.string(),
  dimension_id: z.string(),
  dimension_name: z.string(),
  indicator_name: z.string(),
  ano: z.number(),
  descricao: z.string(),
  fonte: z.string(),
});

export const detalhamentoIndicadorSchema = z.object({
  DIMENSÃO: z.string(),
  COMPONENTE: z.string(),
  INDICADOR: z.string(),
  ID: z.string(),
  INDICADOR_NEGATIVADO: z.string().optional(),
  ANO: z.number(),
  FONTE: z.string(),
  DESCRICAO_CALCULO: z.string(),
  UNIDADE: z.string(),
  INTERPRETACAO: z.string(),
});

export const indicadoresSchema = z.array(indicadorPilarSchema);
export const detalhamentoIndicadoresSchema = z.array(detalhamentoIndicadorSchema);

export const appDataSchema = z.object({
  fomento2026: fomento2026ListSchema,
  fomentoHistorico: fomentoHistoricoListSchema,
  patrocinioHistorico: patrocinioHistoricoListSchema,
  indicadores: indicadoresSchema.optional(),
  detalhamento: detalhamentoIndicadoresSchema.optional(),
});
