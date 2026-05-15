import type { InfraIndicadorCanonico } from '../types';

export interface InfraDetalhamentoIndicadorLegado {
  DIMENSAO?: string;
  COMPONENTE?: string;
  INDICADOR?: string;
  ID?: string;
  INDICADOR_NEGATIVADO?: string;
  ANO?: string | number;
  FONTE?: string;
  DESCRICAO?: string;
  UNIDADE?: string;
  INTERPRETACAO?: string;
}

export interface InfraRelacaoIndicadorLegada {
  indicator_id?: string;
  component_id?: string;
}

interface RelacaoIndicadorCanonica {
  indicador_id: string;
  componente_id: string;
}

export interface ResultadoNormalizacaoInfraIndicadores {
  infra_indicadores: InfraIndicadorCanonico[];
  total_linhas_origem: number;
  total_indicadores: number;
  indicadores_duplicados: string[];
  indicadores_sem_relacao: string[];
}

function textoOuIndefinido(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized || undefined;
}

function numeroOuIndefinido(value: unknown): number | undefined {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizarIndicadorNegativado(value: unknown): boolean | undefined {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (!normalized) {
    return undefined;
  }

  return normalized === 'NEGATIVADO';
}

function criarChaveAliasIndicador(indicadorId: string): string {
  return indicadorId.replace(/_/g, '').toLowerCase();
}

function criarIndiceRelacoes(relacoes: InfraRelacaoIndicadorLegada[]): Map<string, RelacaoIndicadorCanonica> {
  const indice = new Map<string, RelacaoIndicadorCanonica>();

  for (const relacao of relacoes) {
    const indicadorId = textoOuIndefinido(relacao.indicator_id);
    const componenteId = textoOuIndefinido(relacao.component_id);

    if (indicadorId && componenteId) {
      const relacaoCanonica = {
        indicador_id: indicadorId,
        componente_id: componenteId,
      };

      if (!indice.has(indicadorId)) {
        indice.set(indicadorId, relacaoCanonica);
      }

      const alias = criarChaveAliasIndicador(indicadorId);

      if (!indice.has(alias)) {
        indice.set(alias, relacaoCanonica);
      }
    }
  }

  return indice;
}

export function normalizarInfraIndicadores(
  detalhamento: InfraDetalhamentoIndicadorLegado[],
  relacoes: InfraRelacaoIndicadorLegada[] = [],
): ResultadoNormalizacaoInfraIndicadores {
  const relacoesPorIndicador = criarIndiceRelacoes(relacoes);
  const indicadoresPorId = new Map<string, InfraIndicadorCanonico>();
  const indicadoresDuplicados = new Set<string>();
  const indicadoresSemRelacao = new Set<string>();

  for (const item of detalhamento) {
    const indicadorIdOrigem = textoOuIndefinido(item.ID);

    if (!indicadorIdOrigem) {
      continue;
    }

    const relacao =
      relacoesPorIndicador.get(indicadorIdOrigem) ??
      relacoesPorIndicador.get(criarChaveAliasIndicador(indicadorIdOrigem));
    const indicadorId = relacao?.indicador_id ?? indicadorIdOrigem;

    if (indicadoresPorId.has(indicadorId)) {
      indicadoresDuplicados.add(indicadorId);
      continue;
    }

    const componenteId = relacao?.componente_id;

    if (!componenteId) {
      indicadoresSemRelacao.add(indicadorIdOrigem);
    }

    indicadoresPorId.set(indicadorId, {
      indicador_id: indicadorId,
      componente_id: componenteId ?? `comp_nao_mapeado__${indicadorId}`,
      nome_indicador: textoOuIndefinido(item.INDICADOR) ?? indicadorId,
      ano: numeroOuIndefinido(item.ANO),
      indicador_negativado: normalizarIndicadorNegativado(item.INDICADOR_NEGATIVADO),
      descricao: textoOuIndefinido(item.DESCRICAO),
      fonte: textoOuIndefinido(item.FONTE),
      unidade: textoOuIndefinido(item.UNIDADE),
      interpretacao: textoOuIndefinido(item.INTERPRETACAO),
    });
  }

  const infraIndicadores = Array.from(indicadoresPorId.values()).sort((a, b) =>
    a.indicador_id.localeCompare(b.indicador_id),
  );

  return {
    infra_indicadores: infraIndicadores,
    total_linhas_origem: detalhamento.length,
    total_indicadores: infraIndicadores.length,
    indicadores_duplicados: Array.from(indicadoresDuplicados).sort(),
    indicadores_sem_relacao: Array.from(indicadoresSemRelacao).sort(),
  };
}
