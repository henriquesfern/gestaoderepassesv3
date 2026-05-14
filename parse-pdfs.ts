import fs from 'fs';
import path from 'path';

async function parseAll() {
  const require = (await import('module')).createRequire(import.meta.url);
  const pdfParse = require('pdf-parse');

  const dir = path.join(process.cwd(), 'editais');
  const files = fs.readdirSync(dir).filter((file) => file.toLowerCase().endsWith('.pdf'));
  console.log('Found PDFs:', files.length);

  let combinedText = '';
  for (const file of files) {
    try {
      console.log(`Parsing ${file}...`);
      const dataBuffer = fs.readFileSync(path.join(dir, file));
      const data = await pdfParse(dataBuffer);
      combinedText += `\n--- INÍCIO DO DOCUMENTO: ${file} ---\n`;
      combinedText += data.text;
      combinedText += `\n--- FIM DO DOCUMENTO: ${file} ---\n`;
    } catch (error) {
      console.error(`Erro ao processar o arquivo ${file}:`, error);
    }
  }

  const outDir = path.join(process.cwd(), 'data');
  const outPath = path.join(outDir, 'editais-context.ts');
  fs.mkdirSync(outDir, { recursive: true });

  const content = `export const EDITAIS_CONTEXT = ${JSON.stringify(combinedText)};\n`;
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Saved context to ${outPath} (${combinedText.length} characters)`);
}

parseAll();
