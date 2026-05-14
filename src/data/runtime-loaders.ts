import Papa from 'papaparse';
import type { InfraComponente, InfraDetalhamento, InfraDimensao, InfraIndicador, InfraMediaBR, InfraState } from '../types/infra';

type CsvRow = Record<string, string | undefined>;

export interface InfraRuntimeData {
  infraEstados: InfraState[];
  mediasBR: InfraMediaBR[];
  dimensoes: InfraDimensao[];
  componentes: InfraComponente[];
  indicadores: InfraIndicador[];
  detalhamento: InfraDetalhamento[];
}

const STATIC_DATA_BASE = '/data';

export async function fetchStaticText(fileName: string): Promise<string> {
  const response = await fetch(`${STATIC_DATA_BASE}/${fileName}`);

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${fileName}: HTTP ${response.status}`);
  }

  return response.text();
}

export function parseCsvRows<T extends CsvRow>(text: string, options?: Papa.ParseConfig<T>): T[] {
  return Papa.parse<T>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    ...options,
  }).data;
}

function toNumber(value: unknown): number {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\u00A0/g, '')
    .replace(/\s+/g, '');

  if (!normalized) {
    return 0;
  }

  if (normalized.includes(',') && normalized.includes('.')) {
    return Number(normalized.replace(/\./g, '').replace(',', '.')) || 0;
  }

  if (normalized.includes(',')) {
    return Number(normalized.replace(',', '.')) || 0;
  }

  return Number(normalized) || 0;
}

function pickField(row: CsvRow, candidates: string[]): string {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (value !== undefined) {
      return String(value);
    }
  }

  return '';
}

export async function loadInfraRuntimeData(): Promise<InfraRuntimeData> {
  const [
    infraEstadosText,
    mediasBRText,
    dimensoesText,
    componentesText,
    indicadoresText,
    detalhamentoText,
  ] = await Promise.all([
    fetchStaticText('infra-br.csv'),
    fetchStaticText('medias_BR.csv'),
    fetchStaticText('dimensoes_0100.csv'),
    fetchStaticText('componentes_0100.csv'),
    fetchStaticText('indicadores_0100.csv'),
    fetchStaticText('detalhamentoindicadores.csv'),
  ]);

  const infraEstados = parseCsvRows<CsvRow>(infraEstadosText).map((row) => ({
    sigla_uf: pickField(row, ['sigla_uf']),
    infra_br: toNumber(pickField(row, ['infra_br'])),
    state_id: toNumber(pickField(row, ['state_id'])),
    rank: toNumber(pickField(row, ['rank'])),
    color: toNumber(pickField(row, ['color'])),
  }));

  const mediasBR = parseCsvRows<CsvRow>(mediasBRText).map((row) => ({
    dimensao: pickField(row, ['dimensao']),
    media_pais_pct: toNumber(pickField(row, ['media_pais_pct'])),
  }));

  const dimensoes = parseCsvRows<CsvRow>(dimensoesText).map((row) => ({
    value: toNumber(pickField(row, ['value'])),
    rank: toNumber(pickField(row, ['rank'])),
    color: toNumber(pickField(row, ['color'])),
    sigla_uf: pickField(row, ['sigla_uf']),
    state_id: toNumber(pickField(row, ['state_id'])),
    dimension_id: pickField(row, ['dimension_id']),
    dimension_name: pickField(row, ['dimension_name']),
  }));

  const componentes = parseCsvRows<CsvRow>(componentesText).map((row) => ({
    value: toNumber(pickField(row, ['value'])),
    rank: toNumber(pickField(row, ['rank'])),
    color: toNumber(pickField(row, ['color'])),
    sigla_uf: pickField(row, ['sigla_uf']),
    state_id: toNumber(pickField(row, ['state_id'])),
    component_id: pickField(row, ['component_id']),
    component_name: pickField(row, ['component_name']),
    dimension_id: pickField(row, ['dimension_id']),
    dimension_name: pickField(row, ['dimension_name']),
  }));

  const indicadores = parseCsvRows<CsvRow>(indicadoresText).map((row) => ({
    value: toNumber(pickField(row, ['value'])),
    rank: toNumber(pickField(row, ['rank'])),
    color: toNumber(pickField(row, ['color'])),
    sigla_uf: pickField(row, ['sigla_uf']),
    state_id: toNumber(pickField(row, ['state_id'])),
    indicator_id: pickField(row, ['indicator_id']),
    component_id: pickField(row, ['component_id']),
    component_name: pickField(row, ['component_name']),
    dimension_id: pickField(row, ['dimension_id']),
    dimension_name: pickField(row, ['dimension_name']),
    indicator_name: pickField(row, ['indicator_name']),
    ano: toNumber(pickField(row, ['ano'])),
    descricao: pickField(row, ['descricao']),
    fonte: pickField(row, ['fonte']),
  }));

  const detalhamento = parseCsvRows<CsvRow>(detalhamentoText).map((row) => ({
    DIMENSAO: pickField(row, ['DIMENSÃO', 'DIMENSÃƒO', 'DIMENSAO']),
    COMPONENTE: pickField(row, ['COMPONENTE']),
    INDICADOR: pickField(row, ['INDICADOR']),
    ID: pickField(row, ['ID']),
    INDICADOR_NEGATIVADO: pickField(row, ['INDICADOR NEGATIVADO', 'INDICADOR_NEGATIVADO']),
    ANO: pickField(row, ['ANO']),
    FONTE: pickField(row, ['FONTE']),
    DESCRICAO: pickField(row, ['DESCRIÇÃO / CÁLCULO', 'DESCRIÃ‡ÃƒO / CÃLCULO', 'DESCRICAO / CALCULO']),
    UNIDADE: pickField(row, ['UNIDADE']),
    INTERPRETACAO: pickField(row, ['INTERPRETAÇÃO', 'INTERPRETAÃ‡ÃƒO', 'INTERPRETACAO']),
  }));

  return {
    infraEstados,
    mediasBR,
    dimensoes,
    componentes,
    indicadores,
    detalhamento,
  };
}
