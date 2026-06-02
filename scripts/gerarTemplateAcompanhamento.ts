import * as XLSX from 'xlsx';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';

type CsvRow = Record<string, string | undefined>;

const ROOT = process.cwd();
const BASE_PATH = resolve(ROOT, 'public', 'data', 'fomento2026.csv');
const ACOMP_PATH = resolve(ROOT, 'public', 'data', 'fomento_2026_acompanhamento.csv');
const OUTPUT_DIR = resolve(ROOT, 'data-inputs');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'atualiza_fomento26.xlsx');

const CABECALHO_EXPORTADO = [
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

const GUIA_FORMATO: Record<string, string> = {
  CNPJ:                   '14 dígitos sem máscara — NÃO alterar',
  SEI:                    'Número do processo SEI — NÃO alterar',
  INICIO_EXECUCAO:        'Data no formato AAAA-MM-DD (ex: 2026-04-15) ou deixar em branco',
  FIM_EXECUCAO:           'Data no formato AAAA-MM-DD (ex: 2026-12-31) ou deixar em branco',
  TERMO_DE_FOMENTO:       'Número do termo (ex: 001/2026) ou deixar em branco',
  STATUS:                 'Texto livre (ex: Em execução, Primeiro Repasse, Concluído)',
  VALOR_PRIMEIRO_REPASSE: 'Valor numérico sem R$ e sem pontos (ex: 80000 ou 80000.50)',
  DATA_PRIMEIRO_REPASSE:  'Data no formato AAAA-MM-DD (ex: 2026-06-30) ou deixar em branco',
  VALOR_SEGUNDO_REPASSE:  'Valor numérico sem R$ e sem pontos (ex: 20000) ou deixar em branco',
  DATA_SEGUNDO_REPASSE:   'Data no formato AAAA-MM-DD ou deixar em branco',
  FISCAL_SUPLENTE:        'Nome do fiscal suplente ou deixar em branco',
  SITUACAO_FINAL:         'Texto livre descrevendo a situação final ou deixar em branco',
};

function parseCsv<T extends CsvRow>(caminho: string, delimitador: string): T[] {
  const texto = readFileSync(caminho, 'utf-8');
  return Papa.parse<T>(texto.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: delimitador,
  }).data;
}

function normalizarCnpj(valor: unknown): string {
  return String(valor ?? '').replace(/\D/g, '');
}

function estilo(cor: string) {
  return {
    fill: { fgColor: { rgb: cor }, patternType: 'solid' },
    font: { bold: false, sz: 10 },
    alignment: { wrapText: false, vertical: 'center' },
    border: {
      top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
      right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
    },
  };
}

function main() {
  const base = parseCsv<CsvRow>(BASE_PATH, ',');
  const acomp = parseCsv<CsvRow>(ACOMP_PATH, ';');

  const acompPorCnpj = new Map(
    acomp.map((row) => [normalizarCnpj(row.CNPJ), row]),
  );

  const colunas = ['ENTIDADE', ...CABECALHO_EXPORTADO];

  const linhaGuia = colunas.map((col) =>
    col === 'ENTIDADE' ? '(referência — não exportado)' : (GUIA_FORMATO[col] ?? ''),
  );

  const linhasDados = base.map((projeto) => {
    const cnpj = normalizarCnpj(projeto.CNPJ);
    const acompRow = acompPorCnpj.get(cnpj) ?? {};

    return [
      String(projeto.ENTIDADE ?? '').trim(),
      cnpj,
      String(projeto.SEI ?? acompRow.SEI ?? '').trim(),
      String(acompRow.INICIO_EXECUCAO ?? '').trim(),
      String(acompRow.FIM_EXECUCAO ?? '').trim(),
      String(acompRow.TERMO_DE_FOMENTO ?? '').trim(),
      String(acompRow.STATUS ?? '').trim(),
      String(acompRow.VALOR_PRIMEIRO_REPASSE ?? '').trim(),
      String(acompRow.DATA_PRIMEIRO_REPASSE ?? '').trim(),
      String(acompRow.VALOR_SEGUNDO_REPASSE ?? '').trim(),
      String(acompRow.DATA_SEGUNDO_REPASSE ?? '').trim(),
      String(acompRow.FISCAL_SUPLENTE ?? '').trim(),
      String(acompRow.SITUACAO_FINAL ?? '').trim(),
    ];
  });

  const aoa = [colunas, linhaGuia, ...linhasDados];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const larguras = [
    { wch: 52 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 },
    { wch: 28 },
  ];
  ws['!cols'] = larguras;

  ws['!freeze'] = { xSplit: 3, ySplit: 2 };

  const totalLinhas = aoa.length;
  const totalCols = colunas.length;

  for (let c = 0; c < totalCols; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    const isRef = c === 0;
    const isLock = c <= 2;
    ws[addr].s = {
      fill: { fgColor: { rgb: isRef ? 'BDD7EE' : isLock ? 'D9E1F2' : '1F4E79' }, patternType: 'solid' },
      font: { bold: true, color: { rgb: isRef || isLock ? '1F3864' : 'FFFFFF' }, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        top:    { style: 'medium', color: { rgb: '2F75B6' } },
        bottom: { style: 'medium', color: { rgb: '2F75B6' } },
        left:   { style: 'thin',   color: { rgb: '2F75B6' } },
        right:  { style: 'thin',   color: { rgb: '2F75B6' } },
      },
    };
  }

  for (let c = 0; c < totalCols; c++) {
    const addr = XLSX.utils.encode_cell({ r: 1, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      fill: { fgColor: { rgb: 'FFF2CC' }, patternType: 'solid' },
      font: { italic: true, color: { rgb: '7F6000' }, sz: 9 },
      alignment: { vertical: 'center', wrapText: true },
    };
  }

  for (let r = 2; r < totalLinhas; r++) {
    const corFundo = r % 2 === 0 ? 'FFFFFF' : 'F2F2F2';
    for (let c = 0; c < totalCols; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      const isRef = c === 0;
      const isLock = c === 1 || c === 2;
      ws[addr].s = {
        ...estilo(isRef ? 'DAEEF3' : isLock ? 'EBF3FB' : corFundo),
        font: { color: { rgb: isRef ? '17375E' : '000000' }, sz: 10 },
      };
    }
  }

  const colunasData = ['INICIO_EXECUCAO', 'FIM_EXECUCAO', 'DATA_PRIMEIRO_REPASSE', 'DATA_SEGUNDO_REPASSE'];
  const indicesData = colunasData.map((col) => colunas.indexOf(col));

  for (let r = 2; r < totalLinhas; r++) {
    for (const c of indicesData) {
      if (c < 0) continue;
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr] && ws[addr].v !== undefined && ws[addr].v !== '') {
        ws[addr].t = 's';
        ws[addr].v = String(ws[addr].v);
        delete ws[addr].z;
      }
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Acompanhamento');
  XLSX.writeFile(wb, OUTPUT_PATH, { bookType: 'xlsx', type: 'binary', cellStyles: true });

  console.log(`Template gerado com sucesso: ${OUTPUT_PATH}`);
  console.log(`Entidades: ${linhasDados.length} | Colunas exportadas: ${CABECALHO_EXPORTADO.length}`);
  console.log('');
  console.log('Instruções de uso:');
  console.log('  1. Abra o arquivo no Excel');
  console.log('  2. Atualize as colunas D a M (INICIO_EXECUCAO até SITUACAO_FINAL)');
  console.log('  3. Não altere as colunas A (ENTIDADE), B (CNPJ) e C (SEI)');
  console.log('  4. Salve e execute: npm run data:importar-fomento2026');
}

main();
