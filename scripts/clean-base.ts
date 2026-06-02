import fs from 'fs';
import Papa from 'papaparse';
import * as path from 'path';

import { normalizeCNPJ, normalizeString, getStateFullName } from '../src/utils/sanitizers';

function sanitizeRows(rawData: any[]) {
  let modifiedCount = 0;

  rawData.forEach((row: any) => {
    if (row.CNPJ !== undefined) {
      const old = row.CNPJ;
      row.CNPJ = normalizeCNPJ(row.CNPJ);
      if (old !== row.CNPJ) modifiedCount++;
    } else if (row.cnpj !== undefined) {
      const old = row.cnpj;
      row.cnpj = normalizeCNPJ(row.cnpj);
      if (old !== row.cnpj) modifiedCount++;
    }

    const entityFields = ['Entidade', 'ENTIDADE', 'Razão Social'];
    entityFields.forEach(field => {
      if (row[field] !== undefined) {
        row[field] = normalizeString(row[field]);
      }
    });

    const stateFields = ['Estado', 'ESTADO', 'SIGLA_UF'];
    stateFields.forEach(field => {
      if (row[field] !== undefined) {
        row[field] = getStateFullName(row[field]);
      }
    });
  });

  return modifiedCount;
}

function processEmbeddedTsFile(filePath: string, varName: string, delimiter = ',') {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Arquivo não encontrado: ${fullPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const match = content.match(new RegExp(`export const ${varName} = \\\`([\\s\\S]*?)\\\`;`));

  if (!match) {
    console.warn(`Não foi possível extrair a string de template de ${filePath}.`);
    return;
  }

  const parsed = Papa.parse<any>(match[1].trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter
  });

  const modifiedCount = sanitizeRows(parsed.data);
  const unparsed = Papa.unparse(parsed.data, { delimiter });
  const finalStr = `export const ${varName} = ${JSON.stringify(`${unparsed}\n`)};\n`;

  fs.writeFileSync(fullPath, finalStr);
  console.log(`Base regenerada: ${filePath} (${parsed.data.length} registros). Modificados/Sanitizados: ${modifiedCount}.`);
}

function processCsvFile(filePath: string, delimiter = ',') {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Arquivo não encontrado: ${fullPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const parsed = Papa.parse<any>(content.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter
  });

  const modifiedCount = sanitizeRows(parsed.data);
  const unparsed = Papa.unparse(parsed.data, { delimiter });

  fs.writeFileSync(fullPath, `${unparsed}\n`);
  console.log(`CSV higienizado: ${filePath} (${parsed.data.length} registros). Modificados/Sanitizados: ${modifiedCount}.`);
}

processEmbeddedTsFile('src/data/cden.ts', 'cdenCSV', ',');
processEmbeddedTsFile('src/data/precursoras.ts', 'precursorasCSV', ',');
processEmbeddedTsFile('src/data/fomento2025.ts', 'fomento2025CSV', ',');
processEmbeddedTsFile('src/data/patrocinio2025.ts', 'patrocinioCSV', ',');

processCsvFile('public/data/fomento2026.csv', ',');
processCsvFile('public/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv', ';');

console.log('Substituição oficial concluída com sucesso. Base nativamente higienizada.');
