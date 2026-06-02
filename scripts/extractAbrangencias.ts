/**
 * Extrai dados estruturados de área de abrangência de cada projeto do Fomento 2026
 * usando Gemini e busca os polígonos municipais na API IBGE.
 *
 * Saídas:
 *   src/data/abrangencias.ts                       — lookup CNPJ → {tipo, municipios[]}
 *   public/maps/brazil-municipios-abrangencia.geojson — polígonos dos municípios de abrangência
 *
 * Uso:
 *   npx tsx scripts/extractAbrangencias.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

// ── Configuração ─────────────────────────────────────────────────────────────

const CSV_PATH      = resolve('public/data/fomento2026.csv');
const OUT_TS        = resolve('src/data/abrangencias.ts');
const OUT_GEOJSON   = resolve('public/maps/brazil-municipios-abrangencia.geojson');

const GEMINI_MODEL  = 'gemini-3-flash-preview';
const BATCH_SIZE    = 8;
const BATCH_DELAY   = 1200;   // ms entre batches Gemini
const IBGE_DELAY    = 350;    // ms entre chamadas IBGE

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadEnvKey(): string {
  for (const f of ['.env.local', '.env']) {
    try {
      const lines = readFileSync(f, 'utf-8').split('\n');
      for (const line of lines) {
        const m = line.match(/^GEMINI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);
        if (m) return m[1];
      }
    } catch { /* arquivo não existe */ }
  }
  throw new Error('GEMINI_API_KEY não encontrada em .env.local ou .env');
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
}

function extrairJson(text: string): unknown {
  // Remove eventual markdown code block
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  // Tenta primeiro o texto limpo, depois busca o primeiro { ... }
  try { return JSON.parse(clean); } catch { /* tenta fallback */ }
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch { /* fallback falhou */ }
  }
  return null;
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TipoAbrangencia = 'municipal' | 'regional' | 'estadual' | 'nacional' | 'indeterminado';

interface MunicipioAbrangencia {
  municipio: string;
  uf: string;
  codigoIbge?: string;
}

interface AbrangenciaEntidade {
  cnpj: string;
  tipo: TipoAbrangencia;
  municipios: MunicipioAbrangencia[];
}

// ── Extração Gemini ───────────────────────────────────────────────────────────

const PROMPT_TEMPLATE = (entidade: string, area: string) => `
Analise a área de abrangência de um projeto de engenharia brasileiro e extraia a localização do impacto.

Entidade: ${entidade}
Área de abrangência: ${area}

Retorne SOMENTE JSON válido (sem markdown, sem texto antes ou depois):
{
  "tipo": "municipal",
  "municipios": [{"municipio": "Nome do Município", "uf": "SP"}]
}

Tipos válidos:
- "municipal": 1-2 municípios nomeados explicitamente
- "regional": vários municípios ou referência a região/vale/polo sem lista completa
- "estadual": abrangência em todo um estado
- "nacional": abrangência nacional ou federal
- "indeterminado": impossível identificar localização específica

Regras:
- Liste apenas municípios explicitamente nomeados (máx 5)
- Para "estadual" e "nacional", use municipios = []
- Normalize nomes com maiúsculas iniciais e sem abreviações
- Use siglas UF de 2 letras maiúsculas
- Se o município estiver abreviado (ex: "S. Paulo"), expanda para o nome completo
`.trim();

async function extrairAbrangenciaGemini(
  ai: GoogleGenAI,
  rows: Array<{ CNPJ: string; ENTIDADE: string; AREA_ABRANGENCIA: string }>
): Promise<AbrangenciaEntidade[]> {
  const resultados: AbrangenciaEntidade[] = [];
  const total = rows.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    console.log(`  Gemini: processando ${i + 1}–${Math.min(i + BATCH_SIZE, total)} de ${total}…`);

    const promises = batch.map(async (row) => {
      const cnpj = row.CNPJ.replace(/\D/g, '').padStart(14, '0');
      const area = (row.AREA_ABRANGENCIA || '').trim();

      if (!area) {
        return { cnpj, tipo: 'indeterminado' as TipoAbrangencia, municipios: [] };
      }

      const prompt = PROMPT_TEMPLATE(row.ENTIDADE, area);
      let tentativas = 0;
      while (tentativas < 3) {
        tentativas++;
        try {
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });
          const text = response.text ?? '';
          const parsed = extrairJson(text) as any;

          if (parsed && typeof parsed.tipo === 'string') {
            const municipios: MunicipioAbrangencia[] = (parsed.municipios || [])
              .filter((m: any) => m?.municipio && m?.uf)
              .map((m: any) => ({ municipio: String(m.municipio).trim(), uf: String(m.uf).trim().toUpperCase() }));
            return { cnpj, tipo: parsed.tipo as TipoAbrangencia, municipios };
          }
        } catch (err) {
          if (tentativas < 3) await sleep(2000);
        }
      }
      console.warn(`    ⚠ Falha após 3 tentativas — CNPJ ${cnpj} marcado como indeterminado`);
      return { cnpj, tipo: 'indeterminado' as TipoAbrangencia, municipios: [] };
    });

    const batchResults = await Promise.all(promises);
    resultados.push(...batchResults);

    if (i + BATCH_SIZE < total) await sleep(BATCH_DELAY);
  }

  return resultados;
}

// ── Lookup IBGE ───────────────────────────────────────────────────────────────

const ibgeMunicCache = new Map<string, Array<{ id: number; nome: string }>>();

async function getMunicipiosUF(uf: string): Promise<Array<{ id: number; nome: string }>> {
  if (ibgeMunicCache.has(uf)) return ibgeMunicCache.get(uf)!;
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`IBGE localidades falhou para UF ${uf}: ${resp.status}`);
  const data = await resp.json() as Array<{ id: number; nome: string }>;
  ibgeMunicCache.set(uf, data);
  return data;
}

async function buscarCodigoIbge(municipio: string, uf: string): Promise<string | undefined> {
  try {
    const lista = await getMunicipiosUF(uf);
    const normAlvo = normalizar(municipio);
    const encontrado = lista.find(m => normalizar(m.nome) === normAlvo);
    if (encontrado) return String(encontrado.id);

    // Fallback: match parcial (começa com)
    const parcial = lista.find(m => normalizar(m.nome).startsWith(normAlvo.slice(0, 8)));
    if (parcial) {
      console.warn(`    ~ Match parcial: "${municipio}" → "${parcial.nome}" (${uf})`);
      return String(parcial.id);
    }
  } catch (err) {
    console.warn(`    ⚠ Erro ao buscar IBGE para ${municipio}/${uf}: ${err}`);
  }
  return undefined;
}

// ── Download GeoJSON IBGE ─────────────────────────────────────────────────────

async function fetchGeoJsonMunicipio(codigoIbge: string): Promise<any | null> {
  const url = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${codigoIbge}?resolucao=5&formato=application/vnd.geo+json`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.warn(`    ⚠ GeoJSON falhou para código ${codigoIbge}: ${err}`);
    return null;
  }
}

// ── Enriquece com códigos IBGE + baixa GeoJSON ────────────────────────────────

async function enriquecerEBaixarGeoJSON(
  abrangencias: AbrangenciaEntidade[]
): Promise<{ abrangencias: AbrangenciaEntidade[]; geojsonFeatures: any[] }> {
  // Coleta municípios únicos que precisam de lookup
  const municipiosUnicos = new Map<string, { municipio: string; uf: string }>();
  for (const a of abrangencias) {
    for (const m of a.municipios) {
      const chave = `${normalizar(m.municipio)}|${m.uf}`;
      if (!municipiosUnicos.has(chave)) municipiosUnicos.set(chave, m);
    }
  }

  console.log(`\n  IBGE: ${municipiosUnicos.size} municípios únicos para lookup…`);

  // Lookup de códigos IBGE
  const codigoMap = new Map<string, string>(); // chave → codigoIbge
  let idx = 0;
  for (const [chave, m] of municipiosUnicos) {
    idx++;
    process.stdout.write(`  [${idx}/${municipiosUnicos.size}] ${m.municipio}/${m.uf}… `);
    const codigo = await buscarCodigoIbge(m.municipio, m.uf);
    if (codigo) {
      codigoMap.set(chave, codigo);
      process.stdout.write(`✓ ${codigo}\n`);
    } else {
      process.stdout.write(`✗ não encontrado\n`);
    }
    await sleep(IBGE_DELAY);
  }

  // Popula codigoIbge nas abrangências
  for (const a of abrangencias) {
    for (const m of a.municipios) {
      const chave = `${normalizar(m.municipio)}|${m.uf}`;
      const codigo = codigoMap.get(chave);
      if (codigo) m.codigoIbge = codigo;
    }
  }

  // Download GeoJSON para cada município com código encontrado
  const codigos = [...new Set(codigoMap.values())];
  console.log(`\n  IBGE GeoJSON: baixando ${codigos.length} polígonos municipais…`);

  const geojsonFeatures: any[] = [];
  const codigoToNomeUF = new Map<string, { nome: string; uf: string }>();
  for (const [chave, codigo] of codigoMap) {
    const [, uf] = chave.split('|');
    const m = municipiosUnicos.get(chave)!;
    codigoToNomeUF.set(codigo, { nome: m.municipio, uf });
  }

  let geoIdx = 0;
  for (const codigo of codigos) {
    geoIdx++;
    const info = codigoToNomeUF.get(codigo)!;
    process.stdout.write(`  [${geoIdx}/${codigos.length}] ${info.nome}/${info.uf}… `);
    const geojson = await fetchGeoJsonMunicipio(codigo);
    if (geojson?.features?.length) {
      const feature = geojson.features[0];
      feature.properties = { codigoIbge: codigo, nome: info.nome, uf: info.uf };
      geojsonFeatures.push(feature);
      process.stdout.write(`✓\n`);
    } else {
      process.stdout.write(`✗\n`);
    }
    await sleep(IBGE_DELAY);
  }

  return { abrangencias, geojsonFeatures };
}

// ── Geração de arquivos de saída ──────────────────────────────────────────────

function gerarTS(abrangencias: AbrangenciaEntidade[]): string {
  const linhas = abrangencias.map(a => {
    const municipiosStr = a.municipios
      .map(m => {
        const ibge = m.codigoIbge ? `, codigoIbge: '${m.codigoIbge}'` : '';
        return `{ municipio: '${m.municipio.replace(/'/g, "\\'")}', uf: '${m.uf}'${ibge} }`;
      })
      .join(', ');
    return `  { cnpj: '${a.cnpj}', tipo: '${a.tipo}', municipios: [${municipiosStr}] },`;
  });

  return `// Gerado automaticamente por scripts/extractAbrangencias.ts — NÃO EDITAR MANUALMENTE
// Fonte: public/data/fomento2026.csv + Gemini ${GEMINI_MODEL} + API IBGE

export type TipoAbrangencia = 'municipal' | 'regional' | 'estadual' | 'nacional' | 'indeterminado';

export interface MunicipioAbrangencia {
  municipio: string;
  uf: string;
  codigoIbge?: string;
}

export interface AbrangenciaEntidade {
  cnpj: string;
  tipo: TipoAbrangencia;
  municipios: MunicipioAbrangencia[];
}

const ABRANGENCIAS: AbrangenciaEntidade[] = [
${linhas.join('\n')}
];

export const abrangenciasMap = new Map<string, AbrangenciaEntidade>(
  ABRANGENCIAS.map(a => [a.cnpj, a])
);

const normalizarCNPJ = (cnpj: string): string =>
  cnpj.replace(/\\D/g, '').padStart(14, '0');

export function getAbrangenciaByCNPJ(cnpj: string): AbrangenciaEntidade | undefined {
  return abrangenciasMap.get(normalizarCNPJ(cnpj));
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== extractAbrangencias.ts ===\n');

  // 1. Lê CSV
  console.log('1. Lendo CSV…');
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const { data: rows } = Papa.parse<{ CNPJ: string; ENTIDADE: string; AREA_ABRANGENCIA: string }>(
    csvText, { header: true, skipEmptyLines: true }
  );
  console.log(`   ${rows.length} registros lidos.\n`);

  // 2. Inicializa Gemini
  console.log('2. Inicializando Gemini…');
  const apiKey = loadEnvKey();
  const ai = new GoogleGenAI({ apiKey });
  console.log(`   Modelo: ${GEMINI_MODEL}\n`);

  // 3. Extração via Gemini
  console.log('3. Extraindo abrangências com Gemini…');
  const abrangencias = await extrairAbrangenciaGemini(ai, rows);

  // Resumo
  const contagem: Record<string, number> = {};
  abrangencias.forEach(a => { contagem[a.tipo] = (contagem[a.tipo] || 0) + 1; });
  console.log('\n   Resultado da extração:');
  Object.entries(contagem).forEach(([k, v]) => console.log(`     ${k}: ${v}`));

  // 4. Enriquece com IBGE + baixa GeoJSON
  console.log('\n4. Lookup IBGE e download de polígonos…');
  const { abrangencias: abrangenciasEnriquecidas, geojsonFeatures } =
    await enriquecerEBaixarGeoJSON(abrangencias);

  // 5. Escreve saídas
  console.log('\n5. Escrevendo arquivos de saída…');

  writeFileSync(OUT_TS, gerarTS(abrangenciasEnriquecidas), 'utf-8');
  console.log(`   ✓ ${OUT_TS}`);

  const geojson = { type: 'FeatureCollection', features: geojsonFeatures };
  writeFileSync(OUT_GEOJSON, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`   ✓ ${OUT_GEOJSON} (${geojsonFeatures.length} municípios)`);

  // Estatísticas finais
  console.log('\n=== Concluído ===');
  console.log(`Abrangências extraídas: ${abrangenciasEnriquecidas.length}`);
  console.log(`Polígonos municipais:   ${geojsonFeatures.length}`);
  const semCodigo = abrangenciasEnriquecidas
    .flatMap(a => a.municipios)
    .filter(m => !m.codigoIbge).length;
  if (semCodigo > 0)
    console.log(`Municípios sem código IBGE (verificar manualmente): ${semCodigo}`);
}

main().catch(err => { console.error('\n✗ Erro fatal:', err); process.exit(1); });
