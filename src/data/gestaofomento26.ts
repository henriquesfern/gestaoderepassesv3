import Papa from 'papaparse';
import acompanhamentoFomento2026Csv from '../../public/data/fomento_2026_acompanhamento.csv?raw';

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

export interface GestaoFomento26Item {
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

function asText(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeCnpj(value: unknown): string {
  return asText(value).replace(/\D/g, '');
}

function parseDecimal(value: unknown): string | number {
  const text = asText(value);
  if (!text) return '';

  const normalized = Number(text);
  return Number.isFinite(normalized) ? normalized : text;
}

function parseCsv(text: string): AcompanhamentoCsvRow[] {
  return Papa.parse<AcompanhamentoCsvRow>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
  }).data;
}

export const gestaofomento26: GestaoFomento26Item[] = parseCsv(acompanhamentoFomento2026Csv).map((row) => ({
  cnpj: normalizeCnpj(row.CNPJ),
  sei: asText(row.SEI),
  inicioexecucao: asText(row.INICIO_EXECUCAO),
  fimexecucao: asText(row.FIM_EXECUCAO),
  termodefomento: asText(row.TERMO_DE_FOMENTO),
  status: asText(row.STATUS),
  primeirorepasse: parseDecimal(row.VALOR_PRIMEIRO_REPASSE),
  dataprimeirorepasse: asText(row.DATA_PRIMEIRO_REPASSE),
  segundorepasse: parseDecimal(row.VALOR_SEGUNDO_REPASSE),
  datasegundorepasse: asText(row.DATA_SEGUNDO_REPASSE),
  fiscalsuplente: asText(row.FISCAL_SUPLENTE),
  situacaofinal: asText(row.SITUACAO_FINAL),
}));
