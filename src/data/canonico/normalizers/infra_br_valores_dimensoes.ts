import type { InfraValorDimensaoCanonico, UnidadeFederativa } from '../types';

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

export interface InfraValorDimensaoLegado {
  value?: number | string;
  rank?: number | string;
  color?: number | string;
  sigla_uf?: string;
  state_id?: number | string;
  dimension_id?: string;
  dimension_name?: string;
}

export interface ResultadoNormalizacaoInfraValoresDimensoes {
  infra_valores_dimensoes: InfraValorDimensaoCanonico[];
  total_linhas_origem: number;
  pares_duplicados: string[];
  ufs_invalidas: string[];
  dimensoes_sem_cadastro: string[];
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

export function normalizarInfraValoresDimensoes(
  dimensoes: InfraValorDimensaoLegado[],
  dimensoesValidas: string[] = [],
  ufsValidas: string[] = [],
): ResultadoNormalizacaoInfraValoresDimensoes {
  const dimensoesCadastradas = new Set(dimensoesValidas);
  const ufsCadastradas = new Set(ufsValidas);
  const valoresPorPar = new Map<string, InfraValorDimensaoCanonico>();
  const paresDuplicados = new Set<string>();
  const ufsInvalidas = new Set<string>();
  const dimensoesSemCadastro = new Set<string>();
  const estadosSemCadastro = new Set<string>();
  const rankingsInvalidos = new Set<string>();
  const classesInvalidas = new Set<string>();

  for (const item of dimensoes) {
    const ufOrigem = textoOuIndefinido(item.sigla_uf);
    const uf = normalizarUf(ufOrigem);
    const dimensaoId = textoOuIndefinido(item.dimension_id);

    if (!uf) {
      ufsInvalidas.add(ufOrigem ?? '(vazio)');
      continue;
    }

    if (!dimensaoId) {
      dimensoesSemCadastro.add('(vazio)');
      continue;
    }

    if (dimensoesCadastradas.size > 0 && !dimensoesCadastradas.has(dimensaoId)) {
      dimensoesSemCadastro.add(dimensaoId);
    }

    if (ufsCadastradas.size > 0 && !ufsCadastradas.has(uf)) {
      estadosSemCadastro.add(uf);
    }

    const parId = `${dimensaoId}__${uf}`;

    if (valoresPorPar.has(parId)) {
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

    valoresPorPar.set(parId, {
      valor_dimensao_id: parId,
      dimensao_id: dimensaoId,
      uf,
      estado_id: textoOuIndefinido(item.state_id),
      valor: numeroOuZero(item.value),
      ranking,
      cor_classe: corClasse,
    });
  }

  const infraValoresDimensoes = Array.from(valoresPorPar.values()).sort((a, b) =>
    a.valor_dimensao_id.localeCompare(b.valor_dimensao_id),
  );

  return {
    infra_valores_dimensoes: infraValoresDimensoes,
    total_linhas_origem: dimensoes.length,
    pares_duplicados: Array.from(paresDuplicados).sort(),
    ufs_invalidas: Array.from(ufsInvalidas).sort(),
    dimensoes_sem_cadastro: Array.from(dimensoesSemCadastro).sort(),
    estados_sem_cadastro: Array.from(estadosSemCadastro).sort(),
    rankings_invalidos: Array.from(rankingsInvalidos).sort(),
    classes_invalidas: Array.from(classesInvalidas).sort(),
  };
}
