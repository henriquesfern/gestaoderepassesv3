import { z } from 'zod';

const textoObrigatorioSchema = z.string().trim().min(1);
const textoOpcionalSchema = z.string().trim().min(1).optional();

export const cnpjNormalizadoDadosVivosSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ normalizado deve conter 14 digitos.');

export const tipoProjetoDadosVivosSchema = z.enum(['fomento', 'patrocinio']);
export const fonteProjetoDadosVivosSchema = z.enum(['fomento2026', 'fomento2025', 'patrocinio2025']);

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

export const alertaDadosVivosSchema = z.object({
  nivel: z.enum(['aviso', 'erro']),
  codigo: textoObrigatorioSchema,
  mensagem: textoObrigatorioSchema,
  referencia: textoOpcionalSchema,
});

export const modeloDadosVivosParaleloSchema = z.object({
  entidades: z.array(entidadeDadosVivosSchema),
  projetos_base: z.array(projetoBaseDadosVivosSchema),
  alertas: z.array(alertaDadosVivosSchema),
});
