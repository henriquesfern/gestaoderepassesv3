import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import Papa from 'papaparse';

const ROOT = process.cwd();
const DEFAULT_XLSX = resolve(ROOT, 'data-inputs', 'atualiza_fomento26.xlsx');
const OUTPUT_CSV = resolve(ROOT, 'public', 'data', 'fomento_2026_acompanhamento.csv');

const CABECALHO_CSV = [
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

const CNPJ_REGEX = /^\d{14}$/;

function npmRun(comando: string): void {
  const cmd = process.platform === 'win32' ? `npm.cmd run ${comando}` : `npm run ${comando}`;
  console.log(`\n[executando] ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function normalizarCnpj(valor: unknown): string {
  return String(valor ?? '').replace(/\D/g, '').trim();
}

function parseArgs(): { arquivo: string } {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--arquivo');
  return { arquivo: idx >= 0 && args[idx + 1] ? resolve(ROOT, args[idx + 1]) : DEFAULT_XLSX };
}

function lerXlsx(caminho: string): string[][] {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.readFile(caminho, { cellDates: false, raw: false });
  } catch {
    throw new Error(`Arquivo não encontrado ou inválido: ${caminho}`);
  }

  const nomePlanilha = wb.SheetNames.find(
    (n) => n.toLowerCase().includes('acompanhamento'),
  ) ?? wb.SheetNames[0];

  if (!nomePlanilha) throw new Error('Nenhuma planilha encontrada no arquivo XLSX.');

  const ws = wb.Sheets[nomePlanilha];
  const aoa = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' }) as string[][];

  if (aoa.length < 2) throw new Error('Planilha sem dados suficientes (mínimo 2 linhas).');

  return aoa;
}

function detectarColunas(cabecalho: string[]): number[] {
  return CABECALHO_CSV.map((col) => {
    const idx = cabecalho.findIndex(
      (h) => String(h).trim().toUpperCase() === col.toUpperCase(),
    );
    if (idx < 0) throw new Error(`Coluna obrigatória não encontrada no XLSX: "${col}"`);
    return idx;
  });
}

function ehLinhaGuia(linha: string[]): boolean {
  const cnpj = normalizarCnpj(linha[1] ?? linha[0] ?? '');
  return !CNPJ_REGEX.test(cnpj);
}

function exportarCsv(linhas: string[][]): string {
  const cabecalho = CABECALHO_CSV.join(';');
  const corpo = linhas.map((l) => l.join(';')).join('\n');
  return `${cabecalho}\n${corpo}\n`;
}

function main(): void {
  const { arquivo } = parseArgs();

  console.log('Importação de atualização do Fomento 2026');
  console.log(`Arquivo de entrada: ${arquivo}`);
  console.log(`Destino CSV:        ${OUTPUT_CSV}`);

  const aoa = lerXlsx(arquivo);

  const cabecalho = aoa[0].map((h) => String(h).trim());
  const indices = detectarColunas(cabecalho);

  const linhasDados = aoa.slice(1).filter((linha) => !ehLinhaGuia(linha));

  if (linhasDados.length === 0) throw new Error('Nenhuma linha de dados encontrada na planilha.');

  const linhasExportadas = linhasDados.map((linha) =>
    indices.map((i) => String(linha[i] ?? '').trim()),
  );

  const csvAtual = readFileSync(OUTPUT_CSV, 'utf-8');
  const linhasAtuais = Papa.parse<Record<string, string>>(csvAtual.trim(), {
    header: true, skipEmptyLines: true, delimiter: ';',
  }).data;

  console.log(`\nResumo da atualização:`);
  console.log(`  Linhas no XLSX:    ${linhasExportadas.length}`);
  console.log(`  Linhas no CSV atual: ${linhasAtuais.length}`);

  const csvNovo = exportarCsv(linhasExportadas);
  writeFileSync(OUTPUT_CSV, csvNovo, 'utf-8');

  console.log(`\nCSV atualizado em: ${OUTPUT_CSV}`);
  console.log('Executando validação dos arquivos de runtime...');

  try {
    npmRun('data:update-fomento2026-flow');
  } catch {
    console.error('\nValidação falhou. Restaurando CSV anterior...');
    writeFileSync(OUTPUT_CSV, csvAtual, 'utf-8');
    console.error('CSV restaurado. Corrija o arquivo XLSX e tente novamente.');
    process.exit(1);
  }

  console.log('\nImportação concluída com sucesso.');
  console.log('Próximo passo: abra um PR com as alterações em public/data/fomento_2026_acompanhamento.csv');
  console.log('  Execute: npm run flow:status');
}

main();
