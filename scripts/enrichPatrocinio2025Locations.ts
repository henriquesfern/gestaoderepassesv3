/**
 * Enriquece entidadesLocalizacao.ts com as entidades do Patrocínio 2025
 * que ainda não têm localização mapeada.
 *
 * O patrocinio2025.csv não tem coluna Cidade — usamos a API pública da
 * Receita Federal (publica.cnpj.ws) que retorna município oficial + código IBGE.
 * Fallback: Gemini com nome da entidade para CNPJs sem resposta válida.
 *
 * Uso:
 *   npx tsx scripts/enrichPatrocinio2025Locations.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

const LOC_TS    = resolve('src/data/entidadesLocalizacao.ts');
const MUN_TS    = resolve('src/data/municipalities.ts');
const CSV_PATH  = resolve('public/data/patrocinio2025.csv');
const DELAY_RF  = 400;   // ms entre chamadas Receita Federal
const DELAY_IBGE = 350;  // ms entre chamadas IBGE

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── helpers ───────────────────────────────────────────────────────────────────

const normCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
}

function titleCase(s: string): string {
  const lower = ['de','da','do','das','dos','e','a','o','em','no','na','nos','nas'];
  return s.toLowerCase().split(' ').map((w, i) =>
    i === 0 || !lower.includes(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ');
}

function loadEnvKey(): string {
  for (const f of ['.env.local', '.env']) {
    try {
      const m = readFileSync(f, 'utf-8').match(/GEMINI_API_KEY\s*=\s*["']?([^"'\s\n]+)/);
      if (m) return m[1];
    } catch { /* sem arquivo */ }
  }
  throw new Error('GEMINI_API_KEY não encontrada');
}

function extrairJson(text: string): unknown {
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  try { return JSON.parse(clean); } catch { /* fallback */ }
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* ignorar */ } }
  return null;
}

// ── Estado em que a entidadesLocalizacao.ts já está ───────────────────────────

function getCnpjsMapeados(): Set<string> {
  const content = readFileSync(LOC_TS, 'utf-8');
  return new Set([...content.matchAll(/cnpj: '(\d{14})'/g)].map(m => m[1]));
}

function getCitiesMapeadas(): Set<string> {
  const content = readFileSync(MUN_TS, 'utf-8');
  return new Set([...content.matchAll(/name: '([^']+)'/g)].map(m => m[1]));
}

// ── API Receita Federal ────────────────────────────────────────────────────────

async function fetchRF(cnpj: string): Promise<{ cidade: string; uf: string; ibgeId: string } | null> {
  try {
    const resp = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    const est = data?.estabelecimento;
    const cidade = est?.cidade?.nome;
    const uf    = est?.estado?.sigla;
    const ibgeId = String(est?.cidade?.ibge_id ?? '');
    if (!cidade || !uf || !ibgeId) return null;
    return { cidade: titleCase(cidade), uf, ibgeId };
  } catch { return null; }
}

// ── Centroide IBGE ─────────────────────────────────────────────────────────────

async function fetchCentroid(ibgeId: string): Promise<[number, number] | null> {
  try {
    const url = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${ibgeId}?resolucao=5&formato=application/vnd.geo+json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const geo = await resp.json() as any;
    const feature = geo?.features?.[0];
    const ring = feature?.geometry?.type === 'Polygon'
      ? feature.geometry.coordinates[0]
      : feature?.geometry?.coordinates?.[0]?.[0];
    if (!ring?.length) return null;
    const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length;
    return [lng, lat];
  } catch { return null; }
}

// ── Fallback Gemini ────────────────────────────────────────────────────────────

async function fallbackGemini(
  ai: GoogleGenAI, nome: string, estado: string
): Promise<{ cidade: string; uf: string } | null> {
  const prompt = `Qual é o município sede (cidade) da seguinte entidade de engenharia brasileira?
Entidade: ${nome}
Estado informado: ${estado}

Retorne SOMENTE JSON válido (sem markdown):
{"municipio": "Nome do Município", "uf": "XX"}

Se não for possível identificar, retorne: {"municipio": null, "uf": null}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const parsed = extrairJson(response.text ?? '') as any;
    if (parsed?.municipio && parsed?.uf) {
      return { cidade: parsed.municipio, uf: parsed.uf };
    }
  } catch { /* ignorar */ }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== enrichPatrocinio2025Locations.ts ===\n');

  // 1. Lê CSV
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const { data: rows } = Papa.parse<Record<string, string>>(csvText, {
    header: true, skipEmptyLines: true,
  });

  // Entidades únicas
  const uniqueMap = new Map<string, { nome: string; estado: string }>();
  rows.forEach(r => {
    const cnpj = normCNPJ(r['CNPJ'] || '');
    if (cnpj.length === 14 && !uniqueMap.has(cnpj)) {
      uniqueMap.set(cnpj, {
        nome: (r['Entidade'] || '').trim(),
        estado: (r['Estado'] || '').trim(),
      });
    }
  });

  // 2. Filtra não mapeados
  const mapeados   = getCnpjsMapeados();
  const citiesMun  = getCitiesMapeadas();

  const pendentes = Array.from(uniqueMap.entries())
    .filter(([cnpj]) => !mapeados.has(cnpj));

  console.log(`CSV: ${uniqueMap.size} entidades únicas.`);
  console.log(`Já mapeadas: ${mapeados.size} | Pendentes: ${pendentes.length}\n`);

  // 3. Inicializa Gemini (fallback)
  const apiKey = loadEnvKey();
  const ai = new GoogleGenAI({ apiKey });

  // 4. Busca localização para cada pendente
  const novasEntradas: Array<{
    cnpj: string; entidade: string; cidade: string; uf: string;
    codigoIbge?: string; fonte: 'RF' | 'Gemini';
  }> = [];
  const novasCidades: Array<{ name: string; label: string; lat: number; lng: number }> = [];

  let rfOk = 0, geminiOk = 0, falhou = 0;

  for (let i = 0; i < pendentes.length; i++) {
    const [cnpj, { nome, estado }] = pendentes[i];
    process.stdout.write(`  [${i+1}/${pendentes.length}] ${cnpj} — ${nome.slice(0, 45)}…\n`);

    let resultado: { cidade: string; uf: string; ibgeId?: string; fonte: 'RF' | 'Gemini' } | null = null;

    // Tenta Receita Federal
    const rf = await fetchRF(cnpj);
    await sleep(DELAY_RF);

    if (rf) {
      resultado = { cidade: rf.cidade, uf: rf.uf, ibgeId: rf.ibgeId, fonte: 'RF' };
      process.stdout.write(`    ✓ RF: ${rf.cidade}/${rf.uf} (IBGE ${rf.ibgeId})\n`);
      rfOk++;
    } else {
      // Fallback Gemini
      process.stdout.write(`    ~ RF sem resultado — tentando Gemini…\n`);
      const gem = await fallbackGemini(ai, nome, estado);
      if (gem) {
        resultado = { cidade: gem.cidade, uf: gem.uf, fonte: 'Gemini' };
        process.stdout.write(`    ✓ Gemini: ${gem.cidade}/${gem.uf}\n`);
        geminiOk++;
      } else {
        process.stdout.write(`    ✗ Sem resultado\n`);
        falhou++;
        continue;
      }
    }

    // Busca coordenadas se cidade nova
    let lat: number | undefined;
    let lng: number | undefined;
    const cityNorm = normalizar(resultado.cidade);

    if (!citiesMun.has(cityNorm)) {
      const ibgeId = resultado.ibgeId
        ?? novasEntradas.find(e => normalizar(e.cidade) === cityNorm)?.codigoIbge;

      if (ibgeId) {
        const coords = await fetchCentroid(ibgeId);
        await sleep(DELAY_IBGE);
        if (coords) {
          [lng, lat] = coords;
          novasCidades.push({ name: cityNorm, label: resultado.cidade, lat, lng });
          citiesMun.add(cityNorm);
          process.stdout.write(`    + Coords: lat=${lat?.toFixed(4)} lng=${lng?.toFixed(4)}\n`);
        }
      }
    }

    novasEntradas.push({
      cnpj,
      entidade: nome.replace(/'/g, "\\'"),
      cidade: resultado.cidade,
      uf: resultado.uf,
      codigoIbge: resultado.ibgeId,
      fonte: resultado.fonte,
    });
  }

  // 5. Atualiza entidadesLocalizacao.ts
  console.log(`\nAtualizando entidadesLocalizacao.ts…`);
  let locContent = readFileSync(LOC_TS, 'utf-8');
  const novasLinhas = novasEntradas.map(e => {
    const ibge = e.codigoIbge ? `, codigoIbge: '${e.codigoIbge}'` : '';
    return `  { cnpj: '${e.cnpj}', entidade: '${e.entidade}', cidade: '${e.cidade.replace(/'/g, "\\'")}', uf: '${e.uf}', cidade_uf: '${e.cidade}/${e.uf}'.replace(/'/g, "\\'"), confianca: 'Alta' },`;
  }).join('\n');

  // Constrói cidade_uf corretamente
  const linhasCorrigidas = novasEntradas.map(e => {
    const ibge = e.codigoIbge ? `, codigoIbge: '${e.codigoIbge}'` : '';
    const cidade_uf = `${e.cidade}/${e.uf}`.replace(/'/g, "\\'");
    return `  { cnpj: '${e.cnpj}', entidade: '${e.entidade}', cidade: '${e.cidade.replace(/'/g, "\\'")}', uf: '${e.uf}', cidade_uf: '${cidade_uf}'${ibge}, confianca: 'Alta' },`;
  }).join('\n');

  // Normaliza CRLF → LF para garantir que o replace funcione em Windows
  locContent = locContent.replace(/\r\n/g, '\n');
  locContent = locContent.replace(
    /\];\nexport const entidadesLocalizacaoMap/,
    `  // Patrocínio 2025 — adicionado por enrichPatrocinio2025Locations.ts\n${linhasCorrigidas}\n];\nexport const entidadesLocalizacaoMap`
  );
  writeFileSync(LOC_TS, locContent, 'utf-8');
  console.log(`  ✓ ${novasEntradas.length} entradas adicionadas`);

  // 6. Atualiza municipalities.ts
  if (novasCidades.length > 0) {
    console.log(`Atualizando municipalities.ts…`);
    let munContent = readFileSync(MUN_TS, 'utf-8');
    const munLinhas = novasCidades
      .map(c => `  { name: '${c.name}', label: '${c.label.replace(/'/g, "\\'")}', lat: ${c.lat.toFixed(4)}, lng: ${c.lng.toFixed(4)} },`)
      .join('\n');
    munContent = munContent.replace(
      /\];\n\nconst normalizar/,
      `\n  // Patrocínio 2025 — adicionado por enrichPatrocinio2025Locations.ts\n${munLinhas}\n];\n\nconst normalizar`
    );
    writeFileSync(MUN_TS, munContent, 'utf-8');
    console.log(`  ✓ ${novasCidades.length} novas cidades`);
  }

  console.log('\n=== Concluído ===');
  console.log(`Receita Federal: ${rfOk} | Gemini fallback: ${geminiOk} | Sem resultado: ${falhou}`);
  console.log(`Novas entradas: ${novasEntradas.length} | Novas coordenadas: ${novasCidades.length}`);
}

main().catch(e => { console.error('\n✗ Erro:', e); process.exit(1); });
