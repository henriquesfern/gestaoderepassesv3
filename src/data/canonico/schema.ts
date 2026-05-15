import { z } from 'zod';

const textoObrigatorioSchema = z.string().trim().min(1);
const textoOpcionalSchema = z.string().trim().min(1).optional();

export const programaTipoSchema = z.enum(['fomento', 'patrocinio']);
export const fonteDadosClassificacaoSchema = z.enum(['fonte', 'espelho', 'derivado', 'legado']);

export const ufSchema = z.enum([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

export const cnpjCanonicoSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ canonico deve conter 14 digitos numericos.');

export const anoCanonicoSchema = z.number().int().min(2000).max(2100);
export const valorMonetarioCanonicoSchema = z.number().finite().min(0);
export const notaCanonicaSchema = z.number().finite().min(0);
export const scoreCanonicoSchema = z.number().finite().min(0);

export const entidadeCanonicaSchema = z.object({
  entidade_id: textoObrigatorioSchema,
  nome_entidade: textoObrigatorioSchema,
  cnpj: cnpjCanonicoSchema.optional(),
  sigla: textoOpcionalSchema,
  tipo_entidade: textoOpcionalSchema,
  vinculo_cden: z.boolean().optional(),
  vinculo_precursora: z.boolean().optional(),
});

export const projetoCanonicoSchema = z.object({
  projeto_id: textoObrigatorioSchema,
  entidade_id: textoObrigatorioSchema,
  programa: programaTipoSchema,
  ano: anoCanonicoSchema,
  uf: ufSchema.optional(),
  estado: textoOpcionalSchema,
  regiao: textoOpcionalSchema,
  sei: textoOpcionalSchema,
  objetivo: textoOpcionalSchema,
  categoria: textoOpcionalSchema,
  nota: notaCanonicaSchema.optional(),
  objetivo_completo: textoOpcionalSchema,
  area_abrangencia: textoOpcionalSchema,
  objetivo_especifico: textoOpcionalSchema,
  publico_alvo: textoOpcionalSchema,
  objetivo_estrategico: textoOpcionalSchema,
  texto_normalizado: textoOpcionalSchema,
  termo_fomento: textoOpcionalSchema,
  status_execucao: textoOpcionalSchema,
});

export const repasseCanonicoSchema = z.object({
  repasse_id: textoObrigatorioSchema,
  projeto_id: textoObrigatorioSchema,
  entidade_id: textoObrigatorioSchema,
  programa: programaTipoSchema,
  ano: anoCanonicoSchema,
  valor_repasse: valorMonetarioCanonicoSchema,
  valor_projeto: valorMonetarioCanonicoSchema.optional(),
  controle_orcamento: textoOpcionalSchema,
  controle_projeto: textoOpcionalSchema,
  fiscal: textoOpcionalSchema,
  fiscal_suplente: textoOpcionalSchema,
  data_inicio: textoOpcionalSchema,
  data_fim: textoOpcionalSchema,
});

export const programaCanonicoSchema = z.object({
  programa_id: textoObrigatorioSchema,
  programa: programaTipoSchema,
  ano: anoCanonicoSchema,
  descricao: textoOpcionalSchema,
  fonte_dados_id: textoOpcionalSchema,
});

export const estadoCanonicoSchema = z.object({
  uf: ufSchema,
  estado: textoObrigatorioSchema,
  regiao: textoOpcionalSchema,
  estado_id: textoOpcionalSchema,
});

export const fonteDadosCanonicaSchema = z.object({
  fonte_dados_id: textoObrigatorioSchema,
  caminho: textoObrigatorioSchema,
  dominio: textoObrigatorioSchema,
  classificacao: fonteDadosClassificacaoSchema,
  descricao: textoOpcionalSchema,
  atualizado_em: textoOpcionalSchema,
});

export const infraEstadoCanonicoSchema = z.object({
  uf: ufSchema,
  estado_id: textoOpcionalSchema,
  infra_br: z.number().finite(),
  ranking: z.number().int().positive().optional(),
  cor_classe: textoOpcionalSchema,
});

export const infraDimensaoCanonicaSchema = z.object({
  dimensao_id: textoObrigatorioSchema,
  nome_dimensao: textoObrigatorioSchema,
  descricao: textoOpcionalSchema,
});

export const infraValorDimensaoCanonicoSchema = z.object({
  valor_dimensao_id: textoObrigatorioSchema,
  dimensao_id: textoObrigatorioSchema,
  uf: ufSchema,
  estado_id: textoOpcionalSchema,
  valor: z.number().finite(),
  ranking: z.number().int().positive().optional(),
  cor_classe: textoOpcionalSchema,
});

export const infraComponenteCanonicoSchema = z.object({
  componente_id: textoObrigatorioSchema,
  dimensao_id: textoObrigatorioSchema,
  nome_componente: textoObrigatorioSchema,
  descricao: textoOpcionalSchema,
});

export const infraValorComponenteCanonicoSchema = z.object({
  valor_componente_id: textoObrigatorioSchema,
  componente_id: textoObrigatorioSchema,
  dimensao_id: textoObrigatorioSchema,
  uf: ufSchema,
  estado_id: textoOpcionalSchema,
  valor: z.number().finite(),
  ranking: z.number().int().positive().optional(),
  cor_classe: textoOpcionalSchema,
});

export const infraIndicadorCanonicoSchema = z.object({
  indicador_id: textoObrigatorioSchema,
  componente_id: textoObrigatorioSchema,
  nome_indicador: textoObrigatorioSchema,
  ano: anoCanonicoSchema.optional(),
  indicador_negativado: z.boolean().optional(),
  descricao: textoOpcionalSchema,
  fonte: textoOpcionalSchema,
  unidade: textoOpcionalSchema,
  interpretacao: textoOpcionalSchema,
});

export const infraDetalheIndicadorCanonicoSchema = z.object({
  detalhe_indicador_id: textoObrigatorioSchema,
  indicador_id: textoObrigatorioSchema,
  uf: ufSchema,
  valor: z.number().finite(),
  ranking: z.number().int().positive().optional(),
  cor_classe: textoOpcionalSchema,
});

export const aderenciaInfraCanonicaSchema = z.object({
  aderencia_id: textoObrigatorioSchema,
  projeto_id: textoObrigatorioSchema,
  dimensao_id: textoOpcionalSchema,
  componente_id: textoOpcionalSchema,
  indicador_id: textoOpcionalSchema,
  score: scoreCanonicoSchema.optional(),
  ranking: z.number().int().positive().optional(),
  termos_detectados: z.array(textoObrigatorioSchema).optional(),
});

export const modeloCanonicoDadosSchema = z.object({
  entidades: z.array(entidadeCanonicaSchema),
  projetos: z.array(projetoCanonicoSchema),
  repasses: z.array(repasseCanonicoSchema),
  programas: z.array(programaCanonicoSchema),
  estados: z.array(estadoCanonicoSchema),
  fontes_dados: z.array(fonteDadosCanonicaSchema),
  infra_estados: z.array(infraEstadoCanonicoSchema),
  infra_dimensoes: z.array(infraDimensaoCanonicaSchema),
  infra_valores_dimensoes: z.array(infraValorDimensaoCanonicoSchema),
  infra_componentes: z.array(infraComponenteCanonicoSchema),
  infra_valores_componentes: z.array(infraValorComponenteCanonicoSchema),
  infra_indicadores: z.array(infraIndicadorCanonicoSchema),
  infra_detalhes_indicadores: z.array(infraDetalheIndicadorCanonicoSchema),
  aderencias_infra: z.array(aderenciaInfraCanonicaSchema),
});
