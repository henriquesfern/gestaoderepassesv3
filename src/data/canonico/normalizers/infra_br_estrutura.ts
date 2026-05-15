import type { InfraComponenteCanonico, InfraDimensaoCanonica } from '../types';

export interface InfraDimensaoLegada {
  dimension_id?: string;
  dimension_name?: string;
}

export interface InfraComponenteLegado {
  component_id?: string;
  component_name?: string;
  dimension_id?: string;
}

export interface ResultadoNormalizacaoInfraEstrutura {
  infra_dimensoes: InfraDimensaoCanonica[];
  infra_componentes: InfraComponenteCanonico[];
  total_linhas_dimensoes_origem: number;
  total_linhas_componentes_origem: number;
  componentes_sem_dimensao: string[];
}

function textoOuIndefinido(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized || undefined;
}

export function normalizarInfraDimensoes(dimensoes: InfraDimensaoLegada[]): InfraDimensaoCanonica[] {
  const dimensoesPorId = new Map<string, InfraDimensaoCanonica>();

  for (const item of dimensoes) {
    const dimensaoId = textoOuIndefinido(item.dimension_id);

    if (!dimensaoId || dimensoesPorId.has(dimensaoId)) {
      continue;
    }

    dimensoesPorId.set(dimensaoId, {
      dimensao_id: dimensaoId,
      nome_dimensao: textoOuIndefinido(item.dimension_name) ?? dimensaoId,
    });
  }

  return Array.from(dimensoesPorId.values()).sort((a, b) => a.dimensao_id.localeCompare(b.dimensao_id));
}

export function normalizarInfraComponentes(componentes: InfraComponenteLegado[]): InfraComponenteCanonico[] {
  const componentesPorId = new Map<string, InfraComponenteCanonico>();

  for (const item of componentes) {
    const componenteId = textoOuIndefinido(item.component_id);

    if (!componenteId || componentesPorId.has(componenteId)) {
      continue;
    }

    componentesPorId.set(componenteId, {
      componente_id: componenteId,
      dimensao_id: textoOuIndefinido(item.dimension_id) ?? `dim_nao_mapeada__${componenteId}`,
      nome_componente: textoOuIndefinido(item.component_name) ?? componenteId,
    });
  }

  return Array.from(componentesPorId.values()).sort((a, b) => a.componente_id.localeCompare(b.componente_id));
}

export function normalizarInfraEstrutura(
  dimensoes: InfraDimensaoLegada[],
  componentes: InfraComponenteLegado[],
): ResultadoNormalizacaoInfraEstrutura {
  const infraDimensoes = normalizarInfraDimensoes(dimensoes);
  const infraComponentes = normalizarInfraComponentes(componentes);
  const dimensoesValidas = new Set(infraDimensoes.map((dimensao) => dimensao.dimensao_id));

  const componentesSemDimensao = infraComponentes
    .filter((componente) => !dimensoesValidas.has(componente.dimensao_id))
    .map((componente) => componente.componente_id)
    .sort();

  return {
    infra_dimensoes: infraDimensoes,
    infra_componentes: infraComponentes,
    total_linhas_dimensoes_origem: dimensoes.length,
    total_linhas_componentes_origem: componentes.length,
    componentes_sem_dimensao: componentesSemDimensao,
  };
}
