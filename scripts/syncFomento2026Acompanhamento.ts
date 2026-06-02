import { access, readFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

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

async function validarFonteOperacional(): Promise<number> {
  const baseSeiMap = await loadBaseSeiMap();
  const text = await readFile(ACOMPANHAMENTO_CSV_PATH, 'utf-8');
  const headers = parseHeaders(text, ';');
  assertHeaders(headers);

  const rows = parseCsv<AcompanhamentoCsvRow>(text, ';');
  validateRows(rows, baseSeiMap);
  return rows.length;
}

async function bootstrapCsv(): Promise<void> {
  try {
    await access(ACOMPANHAMENTO_CSV_PATH);
  } catch {
    throw new Error('Bootstrap automatico nao esta mais disponivel. Restaure o arquivo public/data/fomento_2026_acompanhamento.csv a partir do Git ou de backup.');
  }

  const rows = await validarFonteOperacional();
  console.log(`Fonte operacional ja disponivel em ${ACOMPANHAMENTO_CSV_PATH} com ${rows} linha(s) validada(s).`);
}

async function syncTs(): Promise<void> {
  const rows = await validarFonteOperacional();
  console.log(`Runtime ja consome ${ACOMPANHAMENTO_CSV_PATH} diretamente. Nenhuma sincronizacao adicional em TypeScript e necessaria. ${rows} linha(s) validada(s).`);
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
