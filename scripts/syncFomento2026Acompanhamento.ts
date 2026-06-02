import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { gestaofomento26 } from '../src/data/gestaofomento26';
import { parseCurrency } from '../src/utils/formatters';

type CsvRow = Record<string, string | undefined>;

interface BaseRow {
  CNPJ?: string;
  SEI?: string;
  [key: string]: string | undefined;
}

interface AcompanhamentoCsvRow {
  CNPJ?: string;
  SEI?: string;
  INICIO_EXECUCAO?: string;
  FIM_EXECUCAO?: string;
  TERMO_DE_FOMENTO?: string;
  STATUS?: string;
  VALOR_PRIMEIRO_REPASSE?: string;
  DATA_PRIMEIRO_REPASSE?: string;
  VALOR_SEGUNDO_REPASSE?: string;
  DATA_SEGUNDO_REPASSE?: string;
  FISCAL_SUPLENTE?: string;
  SITUACAO_FINAL?: string;
  [key: string]: string | undefined;
}

const ROOT = process.cwd();
const BASE_PATH = path.resolve(ROOT, 'public', 'data', 'fomento2026.csv');
const ACOMPANHAMENTO_CSV_PATH = path.resolve(ROOT, 'public', 'data', 'fomento_2026_acompanhamento.csv');
const ACOMPANHAMENTO_TS_PATH = path.resolve(ROOT, 'src', 'data', 'gestaofomento26.ts');

const HEADERS = [
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

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CNPJ_REGEX = /^\d{14}$/;
const DECIMAL_REGEX = /^-?\d+(?:\.\d+)?$/;

function normalizeCnpj(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

function asText(value: unknown): string {
  return String(value ?? '').trim();
}

function parseCsv<T extends CsvRow>(text: string, delimiter: string): T[] {
  return Papa.parse<T>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
  }).data;
}

function parseHeaders(text: string, delimiter: string): string[] {
  const parsed = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  return parsed.meta.fields ?? [];
}

function toDecimalString(value: unknown): string {
  const parsed = parseCurrency(asText(value));
  if (!Number.isFinite(parsed) || parsed === 0) {
    return '';
  }

  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2);
}

function toTsNumberLiteral(value: string): string | null {
  if (!value) return null;
  return DECIMAL_REGEX.test(value) ? value : null;
}

function escapeTsString(value: string): string {
  return JSON.stringify(value);
}

async function loadBaseSeiMap(): Promise<Map<string, string>> {
  const text = await readFile(BASE_PATH, 'utf-8');
  const rows = parseCsv<BaseRow>(text, ',');
  return new Map(
    rows
      .map((row) => [normalizeCnpj(row.CNPJ), asText(row.SEI)] as const)
      .filter(([cnpj, sei]) => Boolean(cnpj && sei)),
  );
}

function assertHeaders(headers: string[]): void {
  if (headers.length !== HEADERS.length) {
    throw new Error(`Cabecalho do acompanhamento com ${headers.length} colunas. Esperado ${HEADERS.length}.`);
  }

  HEADERS.forEach((header, index) => {
    if (headers[index] !== header) {
      throw new Error(`Coluna ${index + 1} do acompanhamento esperada "${header}", encontrada "${headers[index] ?? 'vazia'}".`);
    }
  });
}

function validateRows(rows: AcompanhamentoCsvRow[], baseSeiMap: Map<string, string>): void {
  const seenPairs = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const cnpj = normalizeCnpj(row.CNPJ);
    const sei = asText(row.SEI);

    if (!CNPJ_REGEX.test(cnpj)) {
      throw new Error(`Linha ${rowNumber}: CNPJ invalido "${row.CNPJ ?? ''}". Use 14 digitos sem mascara.`);
    }

    if (!sei) {
      throw new Error(`Linha ${rowNumber}: campo obrigatorio SEI vazio.`);
    }

    const baseSei = baseSeiMap.get(cnpj);
    if (!baseSei) {
      throw new Error(`Linha ${rowNumber}: CNPJ ${cnpj} nao existe na base atual do Fomento 2026.`);
    }

    if (baseSei !== sei) {
      throw new Error(`Linha ${rowNumber}: SEI ${sei} divergente da base atual para o CNPJ ${cnpj}. Esperado ${baseSei}.`);
    }

    const pairKey = `${cnpj}::${sei}`;
    if (seenPairs.has(pairKey)) {
      throw new Error(`Linha ${rowNumber}: duplicidade do par CNPJ + SEI (${cnpj} / ${sei}).`);
    }
    seenPairs.add(pairKey);

    [
      ['INICIO_EXECUCAO', row.INICIO_EXECUCAO],
      ['FIM_EXECUCAO', row.FIM_EXECUCAO],
      ['DATA_PRIMEIRO_REPASSE', row.DATA_PRIMEIRO_REPASSE],
      ['DATA_SEGUNDO_REPASSE', row.DATA_SEGUNDO_REPASSE],
    ].forEach(([field, value]) => {
      const text = asText(value);
      if (text && !DATE_REGEX.test(text)) {
        throw new Error(`Linha ${rowNumber}: data invalida em ${field}: "${text}". Use YYYY-MM-DD.`);
      }
    });

    [
      ['VALOR_PRIMEIRO_REPASSE', row.VALOR_PRIMEIRO_REPASSE],
      ['VALOR_SEGUNDO_REPASSE', row.VALOR_SEGUNDO_REPASSE],
    ].forEach(([field, value]) => {
      const text = asText(value);
      if (text && !DECIMAL_REGEX.test(text)) {
        throw new Error(`Linha ${rowNumber}: valor invalido em ${field}: "${text}". Use decimal sem R$.`);
      }
    });
  });
}

function buildCsvFromTs(baseSeiMap: Map<string, string>): string {
  const missingSei: string[] = [];

  const rows = gestaofomento26.map((item) => {
    const cnpj = normalizeCnpj(item.cnpj);
    const sei = baseSeiMap.get(cnpj);

    if (!sei) {
      missingSei.push(cnpj);
    }

    return {
      CNPJ: cnpj,
      SEI: sei ?? '',
      INICIO_EXECUCAO: asText(item.inicioexecucao),
      FIM_EXECUCAO: asText(item.fimexecucao),
      TERMO_DE_FOMENTO: asText(item.termodefomento),
      STATUS: asText(item.status),
      VALOR_PRIMEIRO_REPASSE: toDecimalString(item.primeirorepasse),
      DATA_PRIMEIRO_REPASSE: asText(item.dataprimeirorepasse),
      VALOR_SEGUNDO_REPASSE: toDecimalString(item.segundorepasse),
      DATA_SEGUNDO_REPASSE: asText(item.datasegundorepasse),
      FISCAL_SUPLENTE: asText(item.fiscalsuplente),
      SITUACAO_FINAL: asText(item.situacaofinal),
    };
  });

  if (missingSei.length > 0) {
    throw new Error(`Nao foi possivel localizar SEI na base para ${missingSei.length} CNPJ(s): ${missingSei.slice(0, 5).join(', ')}.`);
  }

  return Papa.unparse(rows, {
    delimiter: ';',
    newline: '\n',
    columns: HEADERS,
  });
}

function buildTsFromCsv(rows: AcompanhamentoCsvRow[]): string {
  const rowEntries = rows.map((row) => {
    const cnpj = normalizeCnpj(row.CNPJ);
    const sei = asText(row.SEI);
    const overrides: string[] = [];

    const textFields: Array<[string, string | undefined]> = [
      ['inicioexecucao', row.INICIO_EXECUCAO],
      ['fimexecucao', row.FIM_EXECUCAO],
      ['termodefomento', row.TERMO_DE_FOMENTO],
      ['status', row.STATUS],
      ['dataprimeirorepasse', row.DATA_PRIMEIRO_REPASSE],
      ['datasegundorepasse', row.DATA_SEGUNDO_REPASSE],
      ['fiscalsuplente', row.FISCAL_SUPLENTE],
      ['situacaofinal', row.SITUACAO_FINAL],
    ];

    textFields.forEach(([field, value]) => {
      const text = asText(value);
      if (text) {
        overrides.push(`${field}: ${escapeTsString(text)}`);
      }
    });

    [
      ['primeirorepasse', row.VALOR_PRIMEIRO_REPASSE],
      ['segundorepasse', row.VALOR_SEGUNDO_REPASSE],
    ].forEach(([field, value]) => {
      const numericLiteral = toTsNumberLiteral(asText(value));
      if (numericLiteral !== null) {
        overrides.push(`${field}: ${numericLiteral}`);
      }
    });

    if (overrides.length === 0) {
      return `  emptyItem(${escapeTsString(cnpj)}, ${escapeTsString(sei)}),`;
    }

    return `  { ...emptyItem(${escapeTsString(cnpj)}, ${escapeTsString(sei)}), ${overrides.join(', ')} },`;
  });

  return `export interface GestaoFomento26Item {
  cnpj: string;
  sei?: string;
  inicioexecucao: string;
  fimexecucao: string;
  termodefomento: string;
  status: string;
  primeirorepasse: string | number;
  dataprimeirorepasse: string;
  segundorepasse: string | number;
  datasegundorepasse: string;
  fiscalsuplente: string;
  situacaofinal: string;
  [key: string]: any;
}

const emptyItem = (cnpj: string, sei = ''): GestaoFomento26Item => ({
  cnpj,
  sei,
  inicioexecucao: '',
  fimexecucao: '',
  termodefomento: '',
  status: '',
  primeirorepasse: '',
  dataprimeirorepasse: '',
  segundorepasse: '',
  datasegundorepasse: '',
  fiscalsuplente: '',
  situacaofinal: '',
});

export const gestaofomento26: GestaoFomento26Item[] = [
${rowEntries.join('\n')}
];
`;
}

async function bootstrapCsv(): Promise<void> {
  const baseSeiMap = await loadBaseSeiMap();
  const csv = buildCsvFromTs(baseSeiMap);
  await writeFile(ACOMPANHAMENTO_CSV_PATH, `${csv}\n`, 'utf-8');
  console.log(`CSV operacional de acompanhamento gerado em ${ACOMPANHAMENTO_CSV_PATH}`);
}

async function syncTs(): Promise<void> {
  const baseSeiMap = await loadBaseSeiMap();
  const text = await readFile(ACOMPANHAMENTO_CSV_PATH, 'utf-8');
  const headers = parseHeaders(text, ';');
  assertHeaders(headers);

  const rows = parseCsv<AcompanhamentoCsvRow>(text, ';');
  validateRows(rows, baseSeiMap);

  const ts = buildTsFromCsv(rows);
  await writeFile(ACOMPANHAMENTO_TS_PATH, ts, 'utf-8');
  console.log(`Fonte TypeScript sincronizada em ${ACOMPANHAMENTO_TS_PATH}`);
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? 'sync';

  if (mode === 'bootstrap') {
    await bootstrapCsv();
    return;
  }

  if (mode === 'sync') {
    await syncTs();
    return;
  }

  throw new Error(`Modo desconhecido: ${mode}. Use "bootstrap" ou "sync".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
