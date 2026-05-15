import { copyFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fomento2025CSV } from '../src/data/fomento2025';
import { fomento2026CSV } from '../src/data/fomento2026';
import { patrocinioCSV } from '../src/data/patrocinio2025';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDataDir = path.join(rootDir, 'public', 'data');
const sourceDataDir = path.join(rootDir, 'src', 'data');

async function ensurePublicData() {
  await mkdir(publicDataDir, { recursive: true });
}

async function writeExportedCsv(fileName: string, content: string) {
  await writeFile(path.join(publicDataDir, fileName), content, 'utf8');
}

async function copyStaticCsv(fileName: string) {
  await copyFile(path.join(sourceDataDir, fileName), path.join(publicDataDir, fileName));
}

async function main() {
  await ensurePublicData();

  await Promise.all([
    writeExportedCsv('fomento2025.csv', fomento2025CSV),
    writeExportedCsv('fomento2026.csv', fomento2026CSV),
    writeExportedCsv('patrocinio2025.csv', patrocinioCSV),
    copyStaticCsv('GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv'),
    copyStaticCsv('infra_br_estados.csv'),
    copyStaticCsv('infra_br_medias_brasil.csv'),
    copyStaticCsv('infra_br_dimensoes.csv'),
    copyStaticCsv('infra_br_componentes.csv'),
    copyStaticCsv('infra_br_indicadores.csv'),
    copyStaticCsv('infra_br_detalhamento_indicadores.csv'),
  ]);

  console.log('Datasets estáticos exportados para public/data.');
}

main().catch((error) => {
  console.error('Falha ao exportar datasets estáticos:', error);
  process.exit(1);
});
