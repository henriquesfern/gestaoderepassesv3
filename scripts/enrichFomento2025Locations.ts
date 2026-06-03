/**
 * Enriquece entidadesLocalizacao.ts com as entidades do Fomento 2025
 * que ainda não têm localização mapeada.
 *
 * O fomento2025.csv já possui coluna "Cidade" — não precisa de Gemini.
 * Busca o código IBGE e as coordenadas (centroide) via API do IBGE.
 *
 * Uso:
 *   npx tsx scripts/enrichFomento2025Locations.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';

const LOC_TS      = resolve('src/data/entidadesLocalizacao.ts');
const MUN_TS      = resolve('src/data/municipalities.ts');
const CSV_PATH    = resolve('public/data/fomento2025.csv');
const IBGE_DELAY  = 350;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── helpers ──────────────────────────────────────────────────────────────────

const normalizarCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
}

function titleCase(s: string): string {
  const lower = ['de','da','do','das','dos','e','a','o','em','no','na','nos','nas'];
  return s.toLowerCase().split(' ').map((w, i) =>
    i === 0 || !lower.includes(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ');
}

const ESTADO_TO_UF: Record<string, string> = {
  ACRE:'AC', ALAGOAS:'AL', AMAPA:'AP', AMAZONAS:'AM', BAHIA:'BA',
  CEARA:'CE', 'DISTRITO FEDERAL':'DF', 'ESPIRITO SANTO':'ES', GOIAS:'GO',
  MARANHAO:'MA', 'MATO GROSSO':'MT', 'MATO GROSSO DO SUL':'MS',
  'MINAS GERAIS':'MG', PARA:'PA', PARAIBA:'PB', PARANA:'PR',
  PERNAMBUCO:'PE', PIAUI:'PI', 'RIO DE JANEIRO':'RJ',
  'RIO GRANDE DO NORTE':'RN', 'RIO GRANDE DO SUL':'RS', RONDONIA:'RO',
  RORAIMA:'RR', 'SANTA CATARINA':'SC', 'SAO PAULO':'SP',
  SERGIPE:'SE', TOCANTINS:'TO',
};

// ── Lê CNPJs já mapeados ──────────────────────────────────────────────────────

function getCnpjsMapeados(): Set<string> {
  const content = readFileSync(LOC_TS, 'utf-8');
  const matches = [...content.matchAll(/cnpj: '(\d{14})'/g)];
  return new Set(matches.map(m => m[1]));
}

// ── Lê cities já em municipalities.ts ────────────────────────────────────────

function getCitiesMapeadas(): Set<string> {
  const content = readFileSync(MUN_TS, 'utf-8');
  const matches = [...content.matchAll(/name: '([^']+)'/g)];
  return new Set(matches.map(m => m[1]));
}

// ── IBGE: busca código do município ──────────────────────────────────────────

const ibgeMunicCache = new Map<string, Array<{ id: number; nome: string }>>();

async function getMunicipiosUF(uf: string): Promise<Array<{ id: number; nome: string }>> {
  if (ibgeMunicCache.has(uf)) return ibgeMunicCache.get(uf)!;
  const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
  if (!resp.ok) throw new Error(`IBGE ${uf}: HTTP ${resp.status}`);
  const data = await resp.json() as Array<{ id: number; nome: string }>;
  ibgeMunicCache.set(uf, data);
  return data;
}

async function buscarCodigoIbge(cidade: string, uf: string): Promise<string | undefined> {
  try {
    const lista = await getMunicipiosUF(uf);
    const alvo = normalizar(cidade);
    const exato = lista.find(m => normalizar(m.nome) === alvo);
    if (exato) return String(exato.id);
    // fallback parcial
    const parcial = lista.find(m => normalizar(m.nome).startsWith(alvo.slice(0, 6)));
    if (parcial) {
      console.warn(`    ~ Parcial: "${cidade}" → "${parcial.nome}" (${uf})`);
      return String(parcial.id);
    }
  } catch (e) {
    console.warn(`    ⚠ IBGE falhou para ${cidade}/${uf}: ${e}`);
  }
  return undefined;
}

// ── IBGE: centroide do município ──────────────────────────────────────────────

async function fetchCentroid(codigoIbge: string): Promise<[number, number] | null> {
  try {
    const url = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${codigoIbge}?resolucao=5&formato=application/vnd.geo+json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const geo = await resp.json() as any;
    const feature = geo?.features?.[0];
    if (!feature) return null;
    const ring = feature.geometry?.type === 'Polygon'
      ? feature.geometry.coordinates[0]
      : feature.geometry?.coordinates?.[0]?.[0];
    if (!ring?.length) return null;
    const lng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length;
    return [lng, lat];
  } catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== enrichFomento2025Locations.ts ===\n');

  // 1. Lê CSV
  // CSV em UTF-8 — não usar latin1
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const { data: rows } = Papa.parse<Record<string, string>>(csvText, {
    header: true, skipEmptyLines: true,
  });
  console.log(`CSV: ${rows.length} linhas lidas.`);

  // 2. Filtra não mapeados
  const mapeados = getCnpjsMapeados();
  const citiesMapeadas = getCitiesMapeadas();

  const novos = rows
    .map(r => ({
      cnpj: normalizarCNPJ(r['CNPJ'] || ''),
      cidadeRaw: (r['Cidade'] || '').trim(),
      estadoRaw: (r['Estado'] || '').trim(),
      entidade: (r['Razão Social'] || r['Sigla'] || '').trim(),
    }))
    .filter(r => r.cnpj.length === 14 && r.cidadeRaw && !mapeados.has(r.cnpj));

  // Deduplica por CNPJ
  const uniqueMap = new Map<string, typeof novos[0]>();
  novos.forEach(r => { if (!uniqueMap.has(r.cnpj)) uniqueMap.set(r.cnpj, r); });
  const novosList = Array.from(uniqueMap.values());

  console.log(`Novos a enriquecer: ${novosList.length}\n`);

  // 3. Para cada novo, determina UF + busca IBGE + centroide
  const novasEntradas: Array<{
    cnpj: string; entidade: string; cidade: string; uf: string;
    cidade_uf: string; codigoIbge?: string; lat?: number; lng?: number;
  }> = [];
  const novasCidades: Array<{ name: string; label: string; lat: number; lng: number }> = [];

  for (let i = 0; i < novosList.length; i++) {
    const r = novosList[i];
    const uf = ESTADO_TO_UF[normalizar(r.estadoRaw)] ?? '??';
    const cidade = titleCase(r.cidadeRaw);
    const cidadeNorm = normalizar(r.cidadeRaw);

    process.stdout.write(`  [${i+1}/${novosList.length}] ${cidade}/${uf} (CNPJ ${r.cnpj})… `);

    let codigoIbge: string | undefined;
    let lat: number | undefined;
    let lng: number | undefined;

    if (uf !== '??') {
      codigoIbge = await buscarCodigoIbge(r.cidadeRaw, uf);
      await sleep(IBGE_DELAY);

      if (codigoIbge && !citiesMapeadas.has(cidadeNorm)) {
        const coords = await fetchCentroid(codigoIbge);
        await sleep(IBGE_DELAY);
        if (coords) {
          [lng, lat] = coords;
          novasCidades.push({ name: cidadeNorm, label: cidade, lat, lng });
          citiesMapeadas.add(cidadeNorm);
          process.stdout.write(`✓ IBGE ${codigoIbge} coords OK\n`);
        } else {
          process.stdout.write(`✓ IBGE ${codigoIbge} sem coords\n`);
        }
      } else if (codigoIbge) {
        process.stdout.write(`✓ IBGE ${codigoIbge} (cidade já tem coords)\n`);
      } else {
        process.stdout.write(`✗ IBGE não encontrado\n`);
      }
    } else {
      process.stdout.write(`✗ UF indeterminado\n`);
    }

    novasEntradas.push({
      cnpj: r.cnpj, entidade: r.entidade.replace(/'/g, "\\'"),
      cidade, uf, cidade_uf: `${cidade}/${uf}`, codigoIbge,
    });
  }

  // 4. Atualiza entidadesLocalizacao.ts
  console.log('\nAtualizando entidadesLocalizacao.ts…');
  let locContent = readFileSync(LOC_TS, 'utf-8');

  const novasLinhas = novasEntradas.map(e => {
    const ibge = e.codigoIbge ? `, codigoIbge: '${e.codigoIbge}'` : '';
    return `  { cnpj: '${e.cnpj}', entidade: '${e.entidade}', cidade: '${e.cidade.replace(/'/g,"\\'")}', uf: '${e.uf}', cidade_uf: '${e.cidade_uf.replace(/'/g,"\\'")}', confianca: 'Alta' },`;
  }).join('\n');

  locContent = locContent.replace(
    /(\];\s*\nexport const entidadesLocalizacaoMap)/,
    `\n  // Fomento 2025 — adicionado por enrichFomento2025Locations.ts\n${novasLinhas}\n];\nexport const entidadesLocalizacaoMap`
  );
  writeFileSync(LOC_TS, locContent, 'utf-8');
  console.log(`  ✓ ${novasEntradas.length} entradas adicionadas`);

  // 5. Atualiza municipalities.ts
  if (novasCidades.length > 0) {
    console.log('\nAtualizando municipalities.ts…');
    let munContent = readFileSync(MUN_TS, 'utf-8');
    const novasMunLinhas = novasCidades
      .map(c => `  { name: '${c.name}', label: '${c.label.replace(/'/g,"\\'")}', lat: ${c.lat.toFixed(4)}, lng: ${c.lng.toFixed(4)} },`)
      .join('\n');
    munContent = munContent.replace(
      /(\/\/ getCityCoordsExact|const normalizar)/,
      `${novasMunLinhas}\n  // Fomento 2025\n];\n\nconst normalizar`
    );
    // Fallback: insere antes de '];\n\nconst normalizar'
    if (!munContent.includes('// Fomento 2025')) {
      munContent = munContent.replace(
        /\];\n\nconst normalizar/,
        `\n  // Fomento 2025 — adicionado por enrichFomento2025Locations.ts\n${novasMunLinhas}\n];\n\nconst normalizar`
      );
    }
    writeFileSync(MUN_TS, munContent, 'utf-8');
    console.log(`  ✓ ${novasCidades.length} novas cidades com coordenadas`);
  }

  console.log('\n=== Concluído ===');
  console.log(`Entradas adicionadas em entidadesLocalizacao.ts: ${novasEntradas.length}`);
  console.log(`Novas coordenadas em municipalities.ts: ${novasCidades.length}`);
  const semUf = novasEntradas.filter(e => e.uf === '??').length;
  if (semUf > 0) console.log(`⚠ ${semUf} entidades com UF indeterminado — verificar manualmente`);
}

main().catch(e => { console.error('\n✗ Erro:', e); process.exit(1); });
