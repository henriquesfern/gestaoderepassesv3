import type { InfraEstadoCanonico, UnidadeFederativa } from '../types';

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

export interface InfraEstadoLegado {
  sigla_uf?: string;
  infra_br?: number | string;
  state_id?: number | string;
  rank?: number | string;
  color?: number | string;
}

export interface ResultadoNormalizacaoInfraEstados {
  infra_estados: InfraEstadoCanonico[];
  total_linhas_origem: number;
  ufs_duplicadas: string[];
  ufs_invalidas: string[];
  ufs_ausentes: string[];
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

export function normalizarInfraEstados(estados: InfraEstadoLegado[]): ResultadoNormalizacaoInfraEstados {
  const estadosPorUf = new Map<UnidadeFederativa, InfraEstadoCanonico>();
  const ufsDuplicadas = new Set<string>();
  const ufsInvalidas = new Set<string>();
  const rankingsInvalidos = new Set<string>();
  const classesInvalidas = new Set<string>();

  for (const item of estados) {
    const ufOrigem = textoOuIndefinido(item.sigla_uf);
    const uf = normalizarUf(ufOrigem);

    if (!uf) {
      ufsInvalidas.add(ufOrigem ?? '(vazio)');
      continue;
    }

    if (estadosPorUf.has(uf)) {
      ufsDuplicadas.add(uf);
      continue;
    }

    const ranking = numeroOuZero(item.rank);
    const corClasse = normalizarClasseCor(item.color);

    if (!Number.isInteger(ranking) || ranking < 1 || ranking > 27) {
      rankingsInvalidos.add(uf);
    }

    if (!corClasse) {
      classesInvalidas.add(uf);
    }

    estadosPorUf.set(uf, {
      uf,
      estado_id: textoOuIndefinido(item.state_id),
      infra_br: numeroOuZero(item.infra_br),
      ranking,
      cor_classe: corClasse,
    });
  }

  const ufsAusentes = Array.from(UFS_ESPERADAS)
    .filter((uf) => !estadosPorUf.has(uf))
    .sort();

  const infraEstados = Array.from(estadosPorUf.values()).sort((a, b) => a.uf.localeCompare(b.uf));

  return {
    infra_estados: infraEstados,
    total_linhas_origem: estados.length,
    ufs_duplicadas: Array.from(ufsDuplicadas).sort(),
    ufs_invalidas: Array.from(ufsInvalidas).sort(),
    ufs_ausentes: ufsAusentes,
    rankings_invalidos: Array.from(rankingsInvalidos).sort(),
    classes_invalidas: Array.from(classesInvalidas).sort(),
  };
}
