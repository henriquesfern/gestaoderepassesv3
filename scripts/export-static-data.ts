import { access, copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fomento2025CSV } from '../src/data/fomento2025';
import { patrocinioCSV } from '../src/data/patrocinio2025';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDataDir = path.join(rootDir, 'public', 'data');
const sourceDataDir = path.join(rootDir, 'src', 'data');

const legacyGeneratedDatasets = [
  { fileName: 'fomento2025.csv', content: fomento2025CSV },
  { fileName: 'patrocinio2025.csv', content: patrocinioCSV },
];

const mirroredStaticDatasets = [
  'infra_br_estados.csv',
  'infra_br_medias_brasil.csv',
  'infra_br_dimensoes.csv',
  'infra_br_componentes.csv',
  'infra_br_indicadores.csv',
  'infra_br_detalhamento_indicadores.csv',
];

const officialRuntimeDatasets = [
  'fomento2026.csv',
  'GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv',
  'fomento_2026_acompanhamento.csv',
];

async function ensurePublicData() {
  await mkdir(publicDataDir, { recursive: true });
}

async function writeExportedCsv(fileName: string, content: string) {
  const targetPath = path.join(publicDataDir, fileName);

  try {
    const currentContent = await readFile(targetPath, 'utf8');
    const normalizedCurrent = currentContent.replace(/\r\n/g, '\n');
    const normalizedNext = content.replace(/\r\n/g, '\n');

    if (normalizedCurrent === normalizedNext) {
      return;
    }
  } catch {
    // Se o arquivo ainda nao existir, seguimos com a escrita inicial.
  }

  await writeFile(targetPath, content, 'utf8');
}

async function copyStaticCsv(fileName: string) {
  await copyFile(path.join(sourceDataDir, fileName), path.join(publicDataDir, fileName));
}

async function assertOfficialRuntimeDatasetExists(fileName: string) {
  await access(path.join(publicDataDir, fileName));
}

async function main() {
  await ensurePublicData();

  await Promise.all(legacyGeneratedDatasets.map(({ fileName, content }) => writeExportedCsv(fileName, content)));
  await Promise.all(mirroredStaticDatasets.map((fileName) => copyStaticCsv(fileName)));
  await Promise.all(officialRuntimeDatasets.map((fileName) => assertOfficialRuntimeDatasetExists(fileName)));

  console.log('Exportacao estatica concluida em modo de compatibilidade controlada.');
  console.log(`Gerados a partir de modulos legados: ${legacyGeneratedDatasets.map(({ fileName }) => fileName).join(', ')}.`);
  console.log(`Espelhados para runtime legado auxiliar: ${mirroredStaticDatasets.join(', ')}.`);
  console.log(`Preservados como fontes oficiais sem sobrescrita: ${officialRuntimeDatasets.join(', ')}.`);
}

main().catch((error) => {
  console.error('Falha ao executar a exportacao estatica legada:', error);
  process.exit(1);
});
