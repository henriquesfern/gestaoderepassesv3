import fs from 'fs';
import Papa from 'papaparse';
import * as path from 'path';

// Precisamos importar dos utils/sanitizers. Mas como este é um script isolado que será rodado com tsx, podemos fazer importação relativa:
import { normalizeCNPJ, normalizeString, getStateFullName } from '../src/utils/sanitizers';

function processFile(filePath: string, varName: string, delim = ',') {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Arquivo não encontrado: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Extrair o CSV entre as crases `
  let m = content.match(new RegExp(`export const ${varName} = \\\`([\\s\\S]*?)\\\`;`));
  if (!m) {
      // Se não encontrar com crase, tenta aspas ou JSON dependendo do formato, 
      // mas os 6 arquivos alvos são todos export const var = `...`;
      console.warn(`Não foi possível extrair a string de template de ${filePath}. Tentando outro método...`);
      return;
  }
  let str = m[1].trim();

  // Parseia o CSV com PapaParse
  const parsed = Papa.parse<any>(str, { 
    header: true, 
    skipEmptyLines: true, 
    delimiter: delim 
  });
  
  const rawData = parsed.data;
  let modifiedCount = 0;

  // Percorre cada linha e aplica as funções sanitizers nas colunas-chaves
  rawData.forEach((row: any) => {
      // Normalização de CNPJ
      if (row.CNPJ !== undefined) {
         const old = row.CNPJ;
         row.CNPJ = normalizeCNPJ(row.CNPJ);
         if (old !== row.CNPJ) modifiedCount++;
      } else if (row.cnpj !== undefined) {
         const old = row.cnpj;
         row.cnpj = normalizeCNPJ(row.cnpj);
         if (old !== row.cnpj) modifiedCount++;
      }

      // Normalização de Entidades
      const entityFields = ['Entidade', 'ENTIDADE', 'Razão Social'];
      entityFields.forEach(ef => {
          if (row[ef] !== undefined) {
              row[ef] = normalizeString(row[ef]);
          }
      });

      // Normalização de Estados
      const stateFields = ['Estado', 'ESTADO', 'SIGLA_UF'];
      stateFields.forEach(sf => {
          if (row[sf] !== undefined) {
              row[sf] = getStateFullName(row[sf]);
          }
      });
  });

  // Exporta novamente
  const unparsed = Papa.unparse(rawData, { delimiter: delim });
  
  const finalStr = `export const ${varName} = ${JSON.stringify(unparsed + '\n')};\n`;
  fs.writeFileSync(fullPath, finalStr);
  console.log(`✅ Base regerada: ${filePath} (${rawData.length} registros). Modificados/Sanitizados: ${modifiedCount}.`);
}

// Arquivos para limpar
processFile('src/data/cden.ts', 'cdenCSV', ',');
processFile('src/data/precursoras.ts', 'precursorasCSV', ',');
processFile('src/data/fomento2025.ts', 'fomento2025CSV', ',');
processFile('src/data/patrocinio2025.ts', 'patrocinioCSV', ',');
// Fomento 2026 CSV usa CSV comum.
processFile('src/data/fomento2026.ts', 'fomento2026CSV', ',');
// New Fomento Data é separado por ponto-e-vírgula (;) e usa newFomentoCSV
processFile('src/data/newFomentoData.ts', 'newFomentoCSV', ';');

console.log("-> Substituição oficial concluída com sucesso. Base nativamente higienizada!");
