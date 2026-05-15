import type { InfraValorComponenteCanonico, UnidadeFederativa } from '../types';

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

export interface InfraValorComponenteLegado {
  value?: number | string;
  rank?: number | string;
  color?: number | string;
  sigla_uf?: string;
  state_id?: number | string;
  component_id?: string;
  component_name?: string;
  dimension_id?: string;
  dimension_name?: string;
}

export interface ResultadoNormalizacaoInfraValoresComponentes {
  infra_valores_componentes: InfraValorComponenteCanonico[];
  total_linhas_origem: number;
  pares_duplicados: string[];
  ufs_invalidas: string[];
  componentes_sem_cadastro: string[];
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

export function normalizarInfraValoresComponentes(
  componentes: InfraValorComponenteLegado[],
  componentesValidos: string[] = [],
  dimensoesValidas: string[] = [],
  ufsValidas: string[] = [],
): ResultadoNormalizacaoInfraValoresComponentes {
  const componentesCadastrados = new Set(componentesValidos);
  const dimensoesCadastradas = new Set(dimensoesValidas);
  const ufsCadastradas = new Set(ufsValidas);
  const valoresPorPar = new Map<string, InfraValorComponenteCanonico>();
  const paresDuplicados = new Set<string>();
  const ufsInvalidas = new Set<string>();
  const componentesSemCadastro = new Set<string>();
  const dimensoesSemCadastro = new Set<string>();
  const estadosSemCadastro = new Set<string>();
  const rankingsInvalidos = new Set<string>();
  const classesInvalidas = new Set<string>();

  for (const item of componentes) {
    const ufOrigem = textoOuIndefinido(item.sigla_uf);
    const uf = normalizarUf(ufOrigem);
    const componenteId = textoOuIndefinido(item.component_id);
    const dimensaoId = textoOuIndefinido(item.dimension_id);

    if (!uf) {
      ufsInvalidas.add(ufOrigem ?? '(vazio)');
      continue;
    }

    if (!componenteId) {
      componentesSemCadastro.add('(vazio)');
      continue;
    }

    if (!dimensaoId) {
      dimensoesSemCadastro.add(`(vazio)__${componenteId}`);
      continue;
    }

    if (componentesCadastrados.size > 0 && !componentesCadastrados.has(componenteId)) {
      componentesSemCadastro.add(componenteId);
    }

    if (dimensoesCadastradas.size > 0 && !dimensoesCadastradas.has(dimensaoId)) {
      dimensoesSemCadastro.add(dimensaoId);
    }

    if (ufsCadastradas.size > 0 && !ufsCadastradas.has(uf)) {
      estadosSemCadastro.add(uf);
    }

    const parId = `${componenteId}__${uf}`;

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
      valor_componente_id: parId,
      componente_id: componenteId,
      dimensao_id: dimensaoId,
      uf,
      estado_id: textoOuIndefinido(item.state_id),
      valor: numeroOuZero(item.value),
      ranking,
      cor_classe: corClasse,
    });
  }

  const infraValoresComponentes = Array.from(valoresPorPar.values()).sort((a, b) =>
    a.valor_componente_id.localeCompare(b.valor_componente_id),
  );

  return {
    infra_valores_componentes: infraValoresComponentes,
    total_linhas_origem: componentes.length,
    pares_duplicados: Array.from(paresDuplicados).sort(),
    ufs_invalidas: Array.from(ufsInvalidas).sort(),
    componentes_sem_cadastro: Array.from(componentesSemCadastro).sort(),
    dimensoes_sem_cadastro: Array.from(dimensoesSemCadastro).sort(),
    estados_sem_cadastro: Array.from(estadosSemCadastro).sort(),
    rankings_invalidos: Array.from(rankingsInvalidos).sort(),
    classes_invalidas: Array.from(classesInvalidas).sort(),
  };
}
