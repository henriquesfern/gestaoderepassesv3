import type { InfraDetalheIndicadorCanonico, UnidadeFederativa } from '../types';

const UFS_ESPERADAS = new Set<UnidadeFederativa>([
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

export interface InfraDetalheIndicadorLegado {
  value?: number | string;
  rank?: number | string;
  color?: number | string;
  sigla_uf?: string;
  state_id?: number | string;
  indicator_id?: string;
  component_id?: string;
  component_name?: string;
  dimension_id?: string;
  dimension_name?: string;
  indicator_name?: string;
  ano?: number | string;
  descricao?: string;
  fonte?: string;
}

export interface ResultadoNormalizacaoInfraDetalhesIndicadores {
  infra_detalhes_indicadores: InfraDetalheIndicadorCanonico[];
  total_linhas_origem: number;
  pares_duplicados: string[];
  ufs_invalidas: string[];
  indicadores_sem_cadastro: string[];
  estados_sem_cadastro: string[];
  rankings_invalidos: string[];
  classes_invalidas: string[];
}

function textoOuIndefinido(value: unknown): string | undefined {
  const normalized = String(value ?? '').trim();
  return normalized || undefined;
}

function numeroOuZero(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? '')
    .trim()
    .replace(/\u00A0/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizarUf(value: unknown): UnidadeFederativa | undefined {
  const uf = String(value ?? '').trim().toUpperCase();
  return UFS_ESPERADAS.has(uf as UnidadeFederativa) ? (uf as UnidadeFederativa) : undefined;
}

function normalizarClasseCor(value: unknown): string | undefined {
  const color = Number(String(value ?? '').trim());

  if (![1, 2, 3].includes(color)) {
    return undefined;
  }

  return `classe_${color}`;
}

export function normalizarInfraDetalhesIndicadores(
  indicadores: InfraDetalheIndicadorLegado[],
  indicadoresValidos: string[] = [],
  ufsValidas: string[] = [],
): ResultadoNormalizacaoInfraDetalhesIndicadores {
  const indicadoresCadastrados = new Set(indicadoresValidos);
  const ufsCadastradas = new Set(ufsValidas);
  const detalhesPorPar = new Map<string, InfraDetalheIndicadorCanonico>();
  const paresDuplicados = new Set<string>();
  const ufsInvalidas = new Set<string>();
  const indicadoresSemCadastro = new Set<string>();
  const estadosSemCadastro = new Set<string>();
  const rankingsInvalidos = new Set<string>();
  const classesInvalidas = new Set<string>();

  for (const item of indicadores) {
    const ufOrigem = textoOuIndefinido(item.sigla_uf);
    const uf = normalizarUf(ufOrigem);
    const indicadorId = textoOuIndefinido(item.indicator_id);

    if (!uf) {
      ufsInvalidas.add(ufOrigem ?? '(vazio)');
      continue;
    }

    if (!indicadorId) {
      indicadoresSemCadastro.add('(vazio)');
      continue;
    }

    if (indicadoresCadastrados.size > 0 && !indicadoresCadastrados.has(indicadorId)) {
      indicadoresSemCadastro.add(indicadorId);
    }

    if (ufsCadastradas.size > 0 && !ufsCadastradas.has(uf)) {
      estadosSemCadastro.add(uf);
    }

    const parId = `${indicadorId}__${uf}`;

    if (detalhesPorPar.has(parId)) {
      paresDuplicados.add(parId);
      continue;
    }

    const ranking = numeroOuZero(item.rank);
    const corClasse = normalizarClasseCor(item.color);

    if (!Number.isInteger(ranking) || ranking < 1 || ranking > 27) {
      rankingsInvalidos.add(parId);
    }

    if (!corClasse) {
      classesInvalidas.add(parId);
    }

    detalhesPorPar.set(parId, {
      detalhe_indicador_id: parId,
      indicador_id: indicadorId,
      uf,
      valor: numeroOuZero(item.value),
      ranking,
      cor_classe: corClasse,
    });
  }

  const infraDetalhesIndicadores = Array.from(detalhesPorPar.values()).sort((a, b) =>
    a.detalhe_indicador_id.localeCompare(b.detalhe_indicador_id),
  );

  return {
    infra_detalhes_indicadores: infraDetalhesIndicadores,
    total_linhas_origem: indicadores.length,
    pares_duplicados: Array.from(paresDuplicados).sort(),
    ufs_invalidas: Array.from(ufsInvalidas).sort(),
    indicadores_sem_cadastro: Array.from(indicadoresSemCadastro).sort(),
    estados_sem_cadastro: Array.from(estadosSemCadastro).sort(),
    rankings_invalidos: Array.from(rankingsInvalidos).sort(),
    classes_invalidas: Array.from(classesInvalidas).sort(),
  };
}
