import { readFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { parseCurrency, parseNumberBR } from '../src/utils/formatters';

type CsvRow = Record<string, string | undefined>;

interface RuntimeFileConfig {
  label: string;
  path: string;
  delimiter: ',' | ';';
  requiredHeaders: Array<string | string[]>;
  requiredFields: string[];
  decimalFields?: string[];
  integerFields?: string[];
  currencyFields?: string[];
  dateFields?: string[];
}

interface ParsedArgs {
  basePath: string;
  infraPath: string;
  acompanhamentoPath: string;
}

const CNPJ_REGEX = /^\d{14}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_BASE_PATH = path.resolve(process.cwd(), 'public', 'data', 'fomento2026.csv');
const DEFAULT_INFRA_PATH = path.resolve(process.cwd(), 'public', 'data', 'GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv');
const DEFAULT_ACOMPANHAMENTO_PATH = path.resolve(process.cwd(), 'public', 'data', 'fomento_2026_acompanhamento.csv');

const BASE_HEADERS = [
  'ENTIDADE',
  'CNPJ',
  'ESTADO',
  ['MÃ‰DIA', 'MÉDIA'],
  'VOTOS',
  'VALOR_CONCEDENTEAJUSTADO',
  ['CONTROLEORÃ‡AMENTO', 'CONTROLEORÇAMENTO'],
  'VALORPROJETO',
  'CONTROLEPROJETO',
  ['REGIÃƒO', 'REGIÃO'],
  'OBJETIVO_COMPLETO',
  'AREA_ABRANGENCIA',
  'OBJETIVO_ESPECIFICO',
  'PUBLICO_ALVO',
  'OBJETIVO_ESTRATEGICO',
  'SIGLA_UF',
  'FISCAL',
  'SEI',
  'TEXTO_NORM',
  'RANKING_ADERENCIA_INFRABR',
  'SCORES',
  'DIMENSAO_PRINCIPAL',
  'TERMOS_DETECTADOS',
  'DIMENSAO_1',
  'DIMENSAO_2',
  'DIMENSAO_3',
  'DIMENSAO_4',
  'DIMENSAO_5',
];

const INFRA_HEADERS = [
  'ENTIDADE',
  'CNPJ',
  'objetivo',
  'area_abrangencia',
  ['objetivo_especÃ­fico', 'objetivo_específico'],
  'publico_alvo',
  'objetivo_estrategivo',
  'sigla_uf',
  ['NOTA MÃ‰DIA', 'NOTA MÉDIA'],
  'VALOR CONCEDENTE',
  'FISCAL',
  'SEI',
  'texto_norm',
  'Ranking_Aderencia_InfraBR_M3_3_VALIDADO',
  'Scores_Dimensoes_M3_3_VALIDADO',
  'Ranking_Componentes_M3_3_VALIDADO',
  'Scores_Componentes_M3_3_VALIDADO',
  'Ranking_Indicadores_M3_3_VALIDADO',
  'Scores_Indicadores_M3_3_VALIDADO',
  'Termos_Detectados_M3_3_VALIDADO',
  'Termos_Componentes_M3_3_VALIDADO',
  'Termos_Indicadores_M3_3_VALIDADO',
  'Dimensao_1_M3_3_VALIDADO',
  'Dimensao_2_M3_3_VALIDADO',
  'Dimensao_3_M3_3_VALIDADO',
  'Componente_1_M3_3_VALIDADO',
  'Componente_2_M3_3_VALIDADO',
  'Componente_3_M3_3_VALIDADO',
  'Indicador_1_M3_3_VALIDADO',
  'Indicador_2_M3_3_VALIDADO',
  'Indicador_3_M3_3_VALIDADO',
  'Indicador_4_M3_3_VALIDADO',
  'Dimensao_4_M3_3_VALIDADO',
  'Componente_4_M3_3_VALIDADO',
  'Componente_5_M3_3_VALIDADO',
  'Componente_6_M3_3_VALIDADO',
  'Componente_7_M3_3_VALIDADO',
  'Indicador_5_M3_3_VALIDADO',
  'Indicador_6_M3_3_VALIDADO',
  'Indicador_7_M3_3_VALIDADO',
  'Indicador_8_M3_3_VALIDADO',
  'Indicador_9_M3_3_VALIDADO',
  'Dimensao_5_M3_3_VALIDADO',
];

const ACOMPANHAMENTO_HEADERS = [
  'CNPJ',
  'SEI',
  'INICIO_EXECUCAO',
  'FIM_EXECUCAO',
  'TERMO_DE_FOMENTO',
  'STATUS',
  'VALOR_PRIMEIRO_REPASSE',
  'DATA_PRIMEIRO_REPASSE',
  'VALOR_SEGUNDO_REPASSE',
  'DATA_SEGUNDO_REPASSE',
  'FISCAL_SUPLENTE',
  'SITUACAO_FINAL',
];

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    basePath: DEFAULT_BASE_PATH,
    infraPath: DEFAULT_INFRA_PATH,
    acompanhamentoPath: DEFAULT_ACOMPANHAMENTO_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (!value) continue;

    if (arg === '--base') {
      parsed.basePath = path.resolve(process.cwd(), value);
      index += 1;
      continue;
    }

    if (arg === '--infra') {
      parsed.infraPath = path.resolve(process.cwd(), value);
      index += 1;
      continue;
    }

    if (arg === '--acompanhamento') {
      parsed.acompanhamentoPath = path.resolve(process.cwd(), value);
      index += 1;
    }
  }

  return parsed;
}

function getConfigs(args: ParsedArgs): RuntimeFileConfig[] {
  return [
    {
      label: 'Base real Fomento 2026',
      path: args.basePath,
      delimiter: ',',
      requiredHeaders: BASE_HEADERS,
      requiredFields: ['ENTIDADE', 'CNPJ', 'ESTADO', 'SIGLA_UF', 'FISCAL', 'SEI', 'OBJETIVO_COMPLETO'],
      decimalFields: ['MÃ‰DIA'],
      integerFields: ['VOTOS'],
      currencyFields: ['VALOR_CONCEDENTEAJUSTADO', 'CONTROLEORÃ‡AMENTO', 'VALORPROJETO', 'CONTROLEPROJETO'],
    },
    {
      label: 'Infra-BR real validado Fomento 2026',
      path: args.infraPath,
      delimiter: ';',
      requiredHeaders: INFRA_HEADERS,
      requiredFields: ['ENTIDADE', 'CNPJ', 'SEI', 'FISCAL'],
      decimalFields: ['NOTA MÃ‰DIA'],
      currencyFields: ['VALOR CONCEDENTE'],
    },
    {
      label: 'Acompanhamento real Fomento 2026',
      path: args.acompanhamentoPath,
      delimiter: ';',
      requiredHeaders: ACOMPANHAMENTO_HEADERS,
      requiredFields: ['CNPJ', 'SEI'],
      currencyFields: ['VALOR_PRIMEIRO_REPASSE', 'VALOR_SEGUNDO_REPASSE'],
      dateFields: ['INICIO_EXECUCAO', 'FIM_EXECUCAO', 'DATA_PRIMEIRO_REPASSE', 'DATA_SEGUNDO_REPASSE'],
    },
  ];
}

function isBlank(value: unknown): boolean {
  return String(value ?? '').trim() === '';
}

function normalizeCnpj(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '').trim();
}

function parseCsv(text: string, delimiter: ',' | ';') {
  const parsed = Papa.parse<CsvRow>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  return {
    headers: parsed.meta.fields ?? [],
    rows: parsed.data,
  };
}

function formatExpectedHeader(expected: string | string[]): string {
  return Array.isArray(expected) ? expected.join('" ou "') : expected;
}

function assertHeaders(config: RuntimeFileConfig, headers: string[]): string[] {
  const errors: string[] = [];
  if (headers.length !== config.requiredHeaders.length) {
    errors.push(`${config.label}: cabecalho com ${headers.length} coluna(s), esperado ${config.requiredHeaders.length}.`);
  }

  config.requiredHeaders.forEach((header, index) => {
    const acceptedHeaders = Array.isArray(header) ? header : [header];
    if (!acceptedHeaders.includes(headers[index] ?? '')) {
      errors.push(`${config.label}: coluna ${index + 1} esperada "${formatExpectedHeader(header)}", encontrada "${headers[index] ?? 'vazia'}".`);
    }
  });

  return errors;
}

function validateRequiredFields(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  return config.requiredFields.flatMap((field) => (
    isBlank(row[field]) ? [`${config.label}: linha ${rowNumber} com campo obrigatorio vazio: ${field}.`] : []
  ));
}

function validateCnpj(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  const cnpj = normalizeCnpj(row.CNPJ);
  if (!cnpj) return [];
  if (!CNPJ_REGEX.test(cnpj)) {
    return [`${config.label}: linha ${rowNumber} com CNPJ invalido "${row.CNPJ ?? ''}".`];
  }

  return [];
}

function validateDecimals(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  return (config.decimalFields ?? []).flatMap((field) => {
    const rawValue = String(row[field] ?? '').trim();
    if (!rawValue) return [];

    return Number.isFinite(parseNumberBR(rawValue)) && parseNumberBR(rawValue) !== 0
      ? []
      : rawValue === '0' || rawValue === '0,00'
        ? []
        : [`${config.label}: linha ${rowNumber} com decimal invalido em ${field}: "${rawValue}".`];
  });
}

function validateIntegers(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  return (config.integerFields ?? []).flatMap((field) => {
    const rawValue = String(row[field] ?? '').trim();
    if (!rawValue) return [];

    return /^\d+$/.test(rawValue)
      ? []
      : [`${config.label}: linha ${rowNumber} com inteiro invalido em ${field}: "${rawValue}".`];
  });
}

function validateCurrencyFields(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  return (config.currencyFields ?? []).flatMap((field) => {
    const rawValue = String(row[field] ?? '').trim();
    if (!rawValue) return [];

    return Number.isFinite(parseCurrency(rawValue)) && parseCurrency(rawValue) !== 0
      ? []
      : rawValue === '0' || rawValue === '0,00'
        ? []
        : [`${config.label}: linha ${rowNumber} com valor monetario invalido em ${field}: "${rawValue}".`];
  });
}

function validateDates(config: RuntimeFileConfig, row: CsvRow, rowNumber: number): string[] {
  return (config.dateFields ?? []).flatMap((field) => {
    const rawValue = String(row[field] ?? '').trim();
    if (!rawValue) return [];

    return DATE_REGEX.test(rawValue)
      ? []
      : [`${config.label}: linha ${rowNumber} com data invalida em ${field}: "${rawValue}". Use YYYY-MM-DD.`];
  });
}

function validateDuplicatedPairs(config: RuntimeFileConfig, rows: CsvRow[]): string[] {
  const occurrences = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const cnpj = normalizeCnpj(row.CNPJ);
    const sei = String(row.SEI ?? '').trim();
    if (!cnpj || !sei) return;

    const key = `${cnpj}::${sei}`;
    const current = occurrences.get(key) ?? [];
    current.push(index + 2);
    occurrences.set(key, current);
  });

  return [...occurrences.entries()].flatMap(([key, lines]) => (
    lines.length > 1
      ? [`${config.label}: duplicidade de CNPJ + SEI em ${key.replace('::', ' / ')} nas linhas ${lines.join(', ')}.`]
      : []
  ));
}

function validateDuplicatedCnpj(config: RuntimeFileConfig, rows: CsvRow[]): string[] {
  const occurrences = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const cnpj = normalizeCnpj(row.CNPJ);
    if (!cnpj) return;

    const current = occurrences.get(cnpj) ?? [];
    current.push(index + 2);
    occurrences.set(cnpj, current);
  });

  return [...occurrences.entries()].flatMap(([cnpj, lines]) => (
    lines.length > 1
      ? [`${config.label}: duplicidade de CNPJ ${cnpj} nas linhas ${lines.join(', ')}. O runtime atual indexa esses complementos por CNPJ.`]
      : []
  ));
}

function buildPairSet(rows: CsvRow[]): Set<string> {
  return new Set(
    rows
      .map((row) => `${normalizeCnpj(row.CNPJ)}::${String(row.SEI ?? '').trim()}`)
      .filter((key) => key !== '::'),
  );
}

function comparePairSets(baseRows: CsvRow[], targetRows: CsvRow[], targetLabel: string): string[] {
  const basePairs = buildPairSet(baseRows);
  const targetPairs = buildPairSet(targetRows);
  const errors: string[] = [];

  [...targetPairs].forEach((pair) => {
    if (!basePairs.has(pair)) {
      errors.push(`${targetLabel}: projeto ${pair.replace('::', ' / ')} nao existe na base real do Fomento 2026.`);
    }
  });

  [...basePairs].forEach((pair) => {
    if (!targetPairs.has(pair)) {
      errors.push(`${targetLabel}: projeto da base ${pair.replace('::', ' / ')} nao foi encontrado no arquivo complementar.`);
    }
  });

  return errors;
}

async function validateSingleFile(config: RuntimeFileConfig) {
  const text = await readFile(config.path, 'utf8');
  const { headers, rows } = parseCsv(text, config.delimiter);
  const errors = [
    ...assertHeaders(config, headers),
    ...validateDuplicatedPairs(config, rows),
    ...validateDuplicatedCnpj(config, rows),
  ];

  if (rows.length === 0) {
    errors.push(`${config.label}: arquivo sem linhas de dados.`);
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    errors.push(
      ...validateRequiredFields(config, row, rowNumber),
      ...validateCnpj(config, row, rowNumber),
      ...validateDecimals(config, row, rowNumber),
      ...validateIntegers(config, row, rowNumber),
      ...validateCurrencyFields(config, row, rowNumber),
      ...validateDates(config, row, rowNumber),
    );
  });

  console.log(`${config.label}: ${rows.length} linha(s) validada(s) em ${config.path}`);
  return { rows, errors };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [baseConfig, infraConfig, acompanhamentoConfig] = getConfigs(args);

  const [baseResult, infraResult, acompanhamentoResult] = await Promise.all([
    validateSingleFile(baseConfig),
    validateSingleFile(infraConfig),
    validateSingleFile(acompanhamentoConfig),
  ]);

  const crossErrors = [
    ...comparePairSets(baseResult.rows, infraResult.rows, infraConfig.label),
    ...comparePairSets(baseResult.rows, acompanhamentoResult.rows, acompanhamentoConfig.label),
  ];

  const errors = [
    ...baseResult.errors,
    ...infraResult.errors,
    ...acompanhamentoResult.errors,
    ...crossErrors,
  ];

  if (errors.length > 0) {
    console.error('\nErros encontrados na validacao operacional dos arquivos reais de Fomento 2026:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('\nArquivos reais de Fomento 2026 validados com sucesso.');
}

main().catch((error) => {
  console.error('Falha ao executar a validacao operacional dos arquivos reais de Fomento 2026.');
  console.error(error);
  process.exit(1);
});
