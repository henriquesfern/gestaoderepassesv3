import { readFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

type CsvRow = Record<string, string | undefined>;

interface FileConfig {
  label: string;
  path: string;
  requiredHeaders: string[];
  requiredFields: string[];
  numericFields: string[];
  dateFields: string[];
  pairFields: [string, string];
}

interface ParsedArgs {
  basePath: string;
  infraPath: string;
  acompanhamentoPath: string;
}

const CNPJ_REGEX = /^\d{14}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DECIMAL_REGEX = /^-?\d+(?:\.\d+)?$/;

const DEFAULT_BASE_PATH = path.resolve(process.cwd(), 'docs', 'dados', 'modelos', 'fomento_2026_base.modelo.csv');
const DEFAULT_INFRA_PATH = path.resolve(process.cwd(), 'docs', 'dados', 'modelos', 'fomento_2026_infrabr_validado.modelo.csv');
const DEFAULT_ACOMPANHAMENTO_PATH = path.resolve(process.cwd(), 'docs', 'dados', 'modelos', 'fomento_2026_acompanhamento.modelo.csv');

const BASE_HEADERS = [
  'ENTIDADE',
  'CNPJ',
  'SIGLA_UF',
  'ESTADO',
  'SEI',
  'FISCAL',
  'VALOR_CONCEDENTEAJUSTADO',
  'VALORPROJETO',
  'CONTROLEORCAMENTO',
  'CONTROLEPROJETO',
  'MEDIA',
  'VOTOS',
  'OBJETIVO_ESTRATEGICO',
  'OBJETIVO_COMPLETO',
  'OBJETIVO_ESPECIFICO',
  'AREA_ABRANGENCIA',
  'PUBLICO_ALVO',
  'TEXTO_NORM',
];

const INFRA_HEADERS = [
  'CNPJ',
  'SEI',
  'RANKING_ADERENCIA_INFRABR_VALIDADO',
  'SCORES_DIMENSOES_VALIDADO',
  'RANKING_COMPONENTES_VALIDADO',
  'SCORES_COMPONENTES_VALIDADO',
  'RANKING_INDICADORES_VALIDADO',
  'SCORES_INDICADORES_VALIDADO',
  'TERMOS_DETECTADOS_VALIDADO',
  'TERMOS_COMPONENTES_VALIDADO',
  'TERMOS_INDICADORES_VALIDADO',
  'DIMENSAO_1_VALIDADO',
  'DIMENSAO_2_VALIDADO',
  'DIMENSAO_3_VALIDADO',
  'DIMENSAO_4_VALIDADO',
  'DIMENSAO_5_VALIDADO',
  'COMPONENTE_1_VALIDADO',
  'COMPONENTE_2_VALIDADO',
  'COMPONENTE_3_VALIDADO',
  'COMPONENTE_4_VALIDADO',
  'COMPONENTE_5_VALIDADO',
  'COMPONENTE_6_VALIDADO',
  'COMPONENTE_7_VALIDADO',
  'INDICADOR_1_VALIDADO',
  'INDICADOR_2_VALIDADO',
  'INDICADOR_3_VALIDADO',
  'INDICADOR_4_VALIDADO',
  'INDICADOR_5_VALIDADO',
  'INDICADOR_6_VALIDADO',
  'INDICADOR_7_VALIDADO',
  'INDICADOR_8_VALIDADO',
  'INDICADOR_9_VALIDADO',
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

const FILES = (args: ParsedArgs): FileConfig[] => [
  {
    label: 'Base Fomento 2026',
    path: args.basePath,
    requiredHeaders: BASE_HEADERS,
    requiredFields: [
      'ENTIDADE',
      'CNPJ',
      'SIGLA_UF',
      'ESTADO',
      'SEI',
      'FISCAL',
      'VALOR_CONCEDENTEAJUSTADO',
      'VALORPROJETO',
      'OBJETIVO_ESTRATEGICO',
      'OBJETIVO_COMPLETO',
    ],
    numericFields: [
      'VALOR_CONCEDENTEAJUSTADO',
      'VALORPROJETO',
      'CONTROLEORCAMENTO',
      'CONTROLEPROJETO',
      'MEDIA',
      'VOTOS',
    ],
    dateFields: [],
    pairFields: ['CNPJ', 'SEI'],
  },
  {
    label: 'Infra-BR validado Fomento 2026',
    path: args.infraPath,
    requiredHeaders: INFRA_HEADERS,
    requiredFields: ['CNPJ', 'SEI'],
    numericFields: [],
    dateFields: [],
    pairFields: ['CNPJ', 'SEI'],
  },
  {
    label: 'Acompanhamento Fomento 2026',
    path: args.acompanhamentoPath,
    requiredHeaders: ACOMPANHAMENTO_HEADERS,
    requiredFields: ['CNPJ', 'SEI'],
    numericFields: ['VALOR_PRIMEIRO_REPASSE', 'VALOR_SEGUNDO_REPASSE'],
    dateFields: ['INICIO_EXECUCAO', 'FIM_EXECUCAO', 'DATA_PRIMEIRO_REPASSE', 'DATA_SEGUNDO_REPASSE'],
    pairFields: ['CNPJ', 'SEI'],
  },
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

    if (!value) {
      continue;
    }

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

function isBlank(value: unknown): boolean {
  return String(value ?? '').trim() === '';
}

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const parsed = Papa.parse<CsvRow>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
  });

  return {
    headers: parsed.meta.fields ?? [],
    rows: parsed.data,
  };
}

function assertHeaders(config: FileConfig, headers: string[]): string[] {
  const errors: string[] = [];
  const expected = config.requiredHeaders;

  if (headers.length !== expected.length) {
    errors.push(
      `${config.label}: cabecalho com ${headers.length} coluna(s), esperado ${expected.length}.`,
    );
  }

  expected.forEach((header, index) => {
    if (headers[index] !== header) {
      errors.push(
        `${config.label}: coluna ${index + 1} esperada "${header}", encontrada "${headers[index] ?? 'vazia'}".`,
      );
    }
  });

  return errors;
}

function validateRequiredFields(config: FileConfig, row: CsvRow, rowNumber: number): string[] {
  return config.requiredFields.flatMap((field) => (
    isBlank(row[field])
      ? [`${config.label}: linha ${rowNumber} com campo obrigatorio vazio: ${field}.`]
      : []
  ));
}

function validateCnpj(config: FileConfig, row: CsvRow, rowNumber: number): string[] {
  const cnpj = String(row.CNPJ ?? '').trim();
  if (!cnpj) {
    return [];
  }

  if (!CNPJ_REGEX.test(cnpj)) {
    return [`${config.label}: linha ${rowNumber} com CNPJ invalido "${cnpj}". Esperado 14 digitos sem mascara.`];
  }

  return [];
}

function validateDates(config: FileConfig, row: CsvRow, rowNumber: number): string[] {
  return config.dateFields.flatMap((field) => {
    const value = String(row[field] ?? '').trim();
    if (!value) return [];

    return DATE_REGEX.test(value)
      ? []
      : [`${config.label}: linha ${rowNumber} com data invalida em ${field}: "${value}". Use YYYY-MM-DD.`];
  });
}

function validateNumbers(config: FileConfig, row: CsvRow, rowNumber: number): string[] {
  return config.numericFields.flatMap((field) => {
    const value = String(row[field] ?? '').trim();
    if (!value) return [];

    return DECIMAL_REGEX.test(value)
      ? []
      : [`${config.label}: linha ${rowNumber} com valor numerico invalido em ${field}: "${value}". Use decimal sem R$ e sem separador de milhar.`];
  });
}

function validateDuplicatedPairs(config: FileConfig, rows: CsvRow[]): string[] {
  const [fieldA, fieldB] = config.pairFields;
  const occurrences = new Map<string, number[]>();

  rows.forEach((row, index) => {
    const valueA = String(row[fieldA] ?? '').trim();
    const valueB = String(row[fieldB] ?? '').trim();
    if (!valueA || !valueB) return;

    const key = `${valueA}::${valueB}`;
    const current = occurrences.get(key) ?? [];
    current.push(index + 2);
    occurrences.set(key, current);
  });

  return [...occurrences.entries()].flatMap(([key, lines]) => (
    lines.length > 1
      ? [`${config.label}: duplicidade de ${fieldA} + ${fieldB} em ${key.replace('::', ' / ')} nas linhas ${lines.join(', ')}.`]
      : []
  ));
}

async function validateFile(config: FileConfig): Promise<string[]> {
  const text = await readFile(config.path, 'utf8');
  const { headers, rows } = parseCsv(text);
  const errors = [
    ...assertHeaders(config, headers),
    ...validateDuplicatedPairs(config, rows),
  ];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    errors.push(
      ...validateRequiredFields(config, row, rowNumber),
      ...validateCnpj(config, row, rowNumber),
      ...validateDates(config, row, rowNumber),
      ...validateNumbers(config, row, rowNumber),
    );
  });

  console.log(`${config.label}: ${rows.length} linha(s) validadas em ${config.path}`);
  return errors;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const errors = (await Promise.all(FILES(args).map(validateFile))).flat();

  if (errors.length > 0) {
    console.error('\nErros encontrados na validacao dos arquivos de Fomento 2026:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('\nArquivos de Fomento 2026 validados com sucesso.');
}

main().catch((error) => {
  console.error('Falha ao executar validacao dos arquivos de Fomento 2026.');
  console.error(error);
  process.exit(1);
});
