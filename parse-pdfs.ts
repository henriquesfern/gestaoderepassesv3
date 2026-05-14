import fs from 'fs';
import path from 'path';

type DocumentKind = 'fomento' | 'patrocinio' | 'lei' | 'portaria' | 'decisao_normativa' | 'resolucao' | 'outro';

type DocumentMetadata = {
  kind: DocumentKind;
  year: number | null;
  title: string;
  curatedSummary: string;
  priority: number;
};

const DOCUMENT_METADATA: Record<string, DocumentMetadata> = {
  'DecisaoNormativa122de2024.pdf': {
    kind: 'decisao_normativa',
    year: 2024,
    title: 'Decisão Normativa 122/2024 - Diretrizes para patrocínio no Sistema Confea/Crea',
    curatedSummary: 'Normativo-base que define conceitos, diretrizes, critérios, planejamento, seleção, contratação e avaliação de ações de patrocínio no Sistema Confea/Crea.',
    priority: 70,
  },
  'EditalFomento2024.pdf': {
    kind: 'fomento',
    year: 2024,
    title: 'Edital de Chamamento Público de Fomento 2024',
    curatedSummary: 'Edital de fomento de 2024, com regras de chamamento, elegibilidade, seleção, plano de trabalho, execução e prestação de contas para propostas de fomento.',
    priority: 95,
  },
  'EditalFomento2026.pdf': {
    kind: 'fomento',
    year: 2026,
    title: 'Edital de Chamamento Público de Fomento 2026',
    curatedSummary: 'Edital de fomento de 2026, com regras de chamamento, requisitos, critérios de análise, limites, vedações e orientações para propostas de fomento.',
    priority: 100,
  },
  'ErratEditalFomento2026.pdf': {
    kind: 'fomento',
    year: 2026,
    title: 'Errata do Edital de Fomento 2026',
    curatedSummary: 'Errata vinculada ao edital de fomento de 2026, com ajustes e correções que devem prevalecer sobre o texto original quando aplicáveis.',
    priority: 105,
  },
  'EditalPatrocinio2024.pdf': {
    kind: 'patrocinio',
    year: 2024,
    title: 'Edital de Patrocínio 2024',
    curatedSummary: 'Edital de patrocínio de 2024, com regras de seleção, habilitação, classificação, contrapartidas, contratação e execução de projetos patrocinados.',
    priority: 90,
  },
  'EditalPatrocinio2025.pdf': {
    kind: 'patrocinio',
    year: 2025,
    title: 'Edital de Patrocínio 2025',
    curatedSummary: 'Edital de patrocínio de 2025, com regras de inscrição, critérios de seleção, limites, contrapartidas e procedimentos para contratação.',
    priority: 100,
  },
  'ErrataEditalPatrocinio2025.pdf': {
    kind: 'patrocinio',
    year: 2025,
    title: 'Errata do Edital de Patrocínio 2025',
    curatedSummary: 'Errata vinculada ao edital de patrocínio de 2025, com ajustes e correções que devem ser considerados junto ao edital original.',
    priority: 105,
  },
  'Lei14133de2021LicitacoeseContratos.pdf': {
    kind: 'lei',
    year: 2021,
    title: 'Lei 14.133/2021 - Licitações e Contratos Administrativos',
    curatedSummary: 'Lei geral de licitações e contratos administrativos, usada como referência jurídica complementar para contratações e procedimentos públicos.',
    priority: 50,
  },
  'Portaria113de2026.pdf': {
    kind: 'portaria',
    year: 2026,
    title: 'Portaria 113/2026',
    curatedSummary: 'Portaria de 2026 relacionada ao conjunto normativo de fomento, patrocínio ou operação institucional do Sistema Confea/Crea.',
    priority: 65,
  },
  'Portaria209de2024.pdf': {
    kind: 'portaria',
    year: 2024,
    title: 'Portaria 209/2024',
    curatedSummary: 'Portaria de 2024 relacionada ao conjunto normativo de fomento, patrocínio ou operação institucional do Sistema Confea/Crea.',
    priority: 60,
  },
  'Portaria41de 2026.pdf': {
    kind: 'portaria',
    year: 2026,
    title: 'Portaria 41/2026',
    curatedSummary: 'Portaria de 2026 relacionada ao conjunto normativo de fomento, patrocínio ou operação institucional do Sistema Confea/Crea.',
    priority: 65,
  },
  'Portaria442de2024.pdf': {
    kind: 'portaria',
    year: 2024,
    title: 'Portaria 442/2024',
    curatedSummary: 'Portaria de 2024 relacionada ao conjunto normativo de fomento, patrocínio ou operação institucional do Sistema Confea/Crea.',
    priority: 60,
  },
  'Resolucao1144de24RegistroeRevisaoderegistrodasIEseECs.pdf': {
    kind: 'resolucao',
    year: 2024,
    title: 'Resolução 1.144/2024 - Registro e revisão de registro de IEs e ECs',
    curatedSummary: 'Resolução sobre procedimentos para registro e revisão de registro de instituições de ensino e entidades de classe nos Creas.',
    priority: 45,
  },
};

const STOP_WORDS = new Set([
  'para',
  'pela',
  'pelo',
  'como',
  'com',
  'dos',
  'das',
  'que',
  'uma',
  'por',
  'sao',
  'ser',
  'sera',
  'deve',
  'devera',
  'sobre',
  'entre',
  'confea',
  'crea',
  'sistema',
]);

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cleanPdfText(text: string) {
  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/-\n(?=\p{L})/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferMetadata(fileName: string): DocumentMetadata {
  const known = DOCUMENT_METADATA[fileName];
  if (known) {
    return known;
  }

  const normalized = normalizeText(fileName);
  const yearMatch = fileName.match(/20\d{2}/);
  const year = yearMatch ? Number(yearMatch[0]) : null;

  let kind: DocumentKind = 'outro';
  if (normalized.includes('fomento')) kind = 'fomento';
  else if (normalized.includes('patrocinio')) kind = 'patrocinio';
  else if (normalized.includes('lei')) kind = 'lei';
  else if (normalized.includes('portaria')) kind = 'portaria';
  else if (normalized.includes('decisao')) kind = 'decisao_normativa';
  else if (normalized.includes('resolucao')) kind = 'resolucao';

  return {
    kind,
    year,
    title: fileName.replace(/\.pdf$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2'),
    curatedSummary: 'Documento normativo do conjunto de editais, portarias, leis e resoluções usados como apoio ao assistente de IA.',
    priority: 40,
  };
}

function extractKeywords(text: string) {
  const counts = new Map<string, number>();
  for (const token of normalizeText(text).match(/[a-z0-9]{4,}/g) || []) {
    if (STOP_WORDS.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([token]) => token);
}

function splitIntoChunks(text: string, maxLength = 2600, overlap = 250) {
  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const targetEnd = Math.min(cursor + maxLength, text.length);
    const nextBreak = text.lastIndexOf('\n\n', targetEnd);
    const end = nextBreak > cursor + 900 ? nextBreak : targetEnd;
    const chunk = text.slice(cursor, end).trim();

    if (chunk.length > 120) {
      chunks.push(chunk);
    }

    if (end >= text.length) break;
    cursor = Math.max(0, end - overlap);
  }

  return chunks;
}

function buildExtractiveSummary(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 50 && !line.match(/^https?:\/\//i))
    .slice(0, 4)
    .join(' ')
    .slice(0, 900);
}

async function parseAll() {
  const require = (await import('module')).createRequire(import.meta.url);
  const pdfParse = require('pdf-parse');

  const dir = path.join(process.cwd(), 'editais');
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  console.log('Found PDFs:', files.length);

  let combinedText = '';
  const documents = [];

  for (const file of files) {
    try {
      console.log(`Parsing ${file}...`);
      const dataBuffer = fs.readFileSync(path.join(dir, file));
      const data = await pdfParse(dataBuffer);
      const cleanedText = cleanPdfText(data.text || '');
      const metadata = inferMetadata(file);
      const chunks = splitIntoChunks(cleanedText).map((text, index) => ({
        id: `${slugify(file)}-${index + 1}`,
        ordem: index + 1,
        texto: text,
        palavras_chave: extractKeywords(text),
      }));

      documents.push({
        id: slugify(file),
        arquivo: file,
        tipo: metadata.kind,
        ano: metadata.year,
        titulo: metadata.title,
        resumo: metadata.curatedSummary,
        resumo_extraido: buildExtractiveSummary(cleanedText),
        prioridade: metadata.priority,
        tamanho_texto: cleanedText.length,
        palavras_chave: extractKeywords(`${metadata.title}\n${metadata.curatedSummary}\n${cleanedText}`),
        chunks,
      });

      combinedText += `\n--- INÍCIO DO DOCUMENTO: ${file} ---\n`;
      combinedText += cleanedText;
      combinedText += `\n--- FIM DO DOCUMENTO: ${file} ---\n`;
    } catch (error) {
      console.error(`Erro ao processar o arquivo ${file}:`, error);
    }
  }

  const outDir = path.join(process.cwd(), 'api', '_lib');
  const outPath = path.join(outDir, 'editais-context.js');
  fs.mkdirSync(outDir, { recursive: true });

  const content = `export const EDITAIS_CONTEXT = ${JSON.stringify(combinedText)};\n`;
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Saved context to ${outPath} (${combinedText.length} characters)`);

  const indexPath = path.join(outDir, 'normativos-index.js');
  const indexContent = [
    '// Arquivo gerado por parse-pdfs.ts. Não edite manualmente.',
    `export const NORMATIVOS_INDEX = ${JSON.stringify(documents, null, 2)};`,
    '',
  ].join('\n');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`Saved structured index to ${indexPath} (${documents.length} documents)`);
}

parseAll();
