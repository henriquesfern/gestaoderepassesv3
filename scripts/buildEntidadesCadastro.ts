/**
 * Constrói src/data/entidadesCadastro.ts — cadastro central de entidades.
 *
 * Coleta todos os CNPJs únicos de:
 *   - fomento2026.csv, fomento2025.csv, patrocinio2025.csv
 *   - src/data/cden.ts, src/data/precursoras.ts
 *
 * Para cada CNPJ consulta:
 *   1. API pública da Receita Federal (publica.cnpj.ws) — dados oficiais
 *   2. API IBGE malha — coordenadas do município
 *   3. Gemini (fallback) — quando RF não retorna dados
 *
 * Uso:
 *   npx tsx scripts/buildEntidadesCadastro.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

const OUT_TS    = resolve('src/data/entidadesCadastro.ts');
const DELAY_RF  = 380;
const DELAY_IBGE = 320;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── helpers ───────────────────────────────────────────────────────────────────

const normCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
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

// ── Coleta CNPJs de todas as fontes ──────────────────────────────────────────

interface EntidadeSource {
  cnpj: string;
  nome: string;
  sigla?: string;
  fundacao?: string;
  estado?: string;
  isCDEN: boolean;
  isPrecursora: boolean;
}

function coletarCNPJs(): Map<string, EntidadeSource> {
  const map = new Map<string, EntidadeSource>();

  const add = (cnpj: string, nome: string, opts: Partial<EntidadeSource> = {}) => {
    const c = normCNPJ(cnpj);
    if (c.length !== 14) return;
    if (!map.has(c)) {
      map.set(c, { cnpj: c, nome: nome.trim(), isCDEN: false, isPrecursora: false, ...opts });
    } else {
      // Enriquece flags
      const e = map.get(c)!;
      if (opts.isCDEN) e.isCDEN = true;
      if (opts.isPrecursora) e.isPrecursora = true;
      if (opts.sigla && !e.sigla) e.sigla = opts.sigla;
      if (opts.fundacao && !e.fundacao) e.fundacao = opts.fundacao;
    }
  };

  // CDEN.ts — extrai string CSV do arquivo TS
  const cdenTsContent = readFileSync(resolve('src/data/cden.ts'), 'utf-8');
  const cdenCsvMatch = cdenTsContent.match(/`([^`]+)`/s) || cdenTsContent.match(/"([^"]+Entidade,CNPJ[^"]+)"/s);
  if (cdenCsvMatch) {
    const cdenRows = Papa.parse<{ Entidade: string; CNPJ: string }>(
      cdenCsvMatch[1], { header: true, skipEmptyLines: true }
    ).data;
    cdenRows.forEach(r => {
      if (!r.CNPJ || !r.Entidade) return;
      const parts = r.Entidade.split(' - ');
      const sigla = parts.length > 1 ? parts[0].trim() : undefined;
      add(r.CNPJ, r.Entidade, { sigla, isCDEN: true });
    });
  }

  // Precursoras.ts — extrai string CSV do arquivo TS
  const precTsContent = readFileSync(resolve('src/data/precursoras.ts'), 'utf-8');
  const precCsvMatch = precTsContent.match(/`([^`]+)`/s) || precTsContent.match(/"([^"]+CNPJ,Entidade[^"]+)"/s);
  if (precCsvMatch) {
    const precRows = Papa.parse<{ CNPJ: string; Entidade: string; Sigla: string; Crea: string; 'Fundação': string }>(
      precCsvMatch[1], { header: true, skipEmptyLines: true }
    ).data;
    precRows.forEach(r => {
      if (!r.CNPJ || !r.Entidade) return;
      add(r.CNPJ, r.Entidade, { sigla: r.Sigla, estado: r.Crea, fundacao: r['Fundação'], isPrecursora: true });
    });
  }

  // CSVs operacionais
  const csvFiles = [
    'public/data/fomento2026.csv',
    'public/data/fomento2025.csv',
    'public/data/patrocinio2025.csv',
  ];
  const fieldMaps: Array<{ cnpj: string; nome: string }> = [
    { cnpj: 'CNPJ', nome: 'ENTIDADE' },
    { cnpj: 'CNPJ', nome: 'Razão Social' },
    { cnpj: 'CNPJ', nome: 'Entidade' },
  ];
  csvFiles.forEach((path, i) => {
    const text = readFileSync(resolve(path), 'utf-8');
    const rows = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true }).data;
    const { cnpj: cf, nome: nf } = fieldMaps[i];
    rows.forEach(r => {
      const cnpj = r[cf] || '';
      const nome = r[nf] || r['Sigla'] || '';
      if (cnpj && nome) add(cnpj, nome);
    });
  });

  return map;
}

// ── API Receita Federal ────────────────────────────────────────────────────────

interface RFData {
  razaoSocial: string;
  municipio: string;
  uf: string;
  ibgeId: string;
  situacaoCadastral: string;
  dataInicioAtividade?: string;
  atividadePrincipal?: string;
  email?: string;
  telefone?: string;
}

async function fetchRF(cnpj: string): Promise<RFData | null> {
  try {
    const resp = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    const est = data?.estabelecimento;
    const cidade = est?.cidade?.nome;
    const uf    = est?.estado?.sigla;
    const ibgeId = String(est?.cidade?.ibge_id ?? '');
    if (!cidade || !uf || !ibgeId) return null;
    return {
      razaoSocial: (data.razao_social || '').trim(),
      municipio: cidade.charAt(0).toUpperCase() + cidade.slice(1).toLowerCase(),
      uf,
      ibgeId,
      situacaoCadastral: (est?.situacao_cadastral || 'DESCONHECIDA').trim(),
      dataInicioAtividade: est?.data_inicio_atividade || undefined,
      atividadePrincipal: est?.atividade_principal?.descricao || undefined,
      email: est?.email || undefined,
      telefone: est?.ddd1 && est?.telefone1 ? `(${est.ddd1}) ${est.telefone1}` : undefined,
    };
  } catch { return null; }
}

// ── Centroide IBGE ─────────────────────────────────────────────────────────────

const ibgeCoordsCache = new Map<string, [number, number]>();

async function fetchCentroid(ibgeId: string): Promise<[number, number] | null> {
  if (ibgeCoordsCache.has(ibgeId)) return ibgeCoordsCache.get(ibgeId)!;
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
    const coords: [number, number] = [lat, lng];
    ibgeCoordsCache.set(ibgeId, coords);
    return coords;
  } catch { return null; }
}

// ── Fallback Gemini ────────────────────────────────────────────────────────────

async function fallbackGemini(
  ai: GoogleGenAI, nome: string, estado?: string
): Promise<{ municipio: string; uf: string } | null> {
  const prompt = `Qual é o município sede desta entidade de engenharia brasileira?
Entidade: ${nome}${estado ? `\nEstado/CREA: ${estado}` : ''}

Retorne SOMENTE JSON (sem markdown): {"municipio": "Nome", "uf": "XX"}
Se não souber, retorne: {"municipio": null, "uf": null}`;

  try {
    const r = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const parsed = extrairJson(r.text ?? '') as any;
    if (parsed?.municipio && parsed?.uf) return { municipio: parsed.municipio, uf: parsed.uf };
  } catch { /* ignorar */ }
  return null;
}

// ── Geração do arquivo TypeScript ─────────────────────────────────────────────

interface EntidadeCadastro {
  cnpj: string;
  razaoSocial: string;
  municipio: string;
  uf: string;
  codigoIbge?: string;
  lat?: number;
  lng?: number;
  situacaoCadastral: string;
  dataInicioAtividade?: string;
  atividadePrincipal?: string;
  email?: string;
  telefone?: string;
  sigla?: string;
  fundacao?: string;
  isCDEN: boolean;
  isPrecursora: boolean;
  fonteLocalizacao: 'RF' | 'Gemini' | 'Indeterminado';
}

function gerarTS(entidades: EntidadeCadastro[]): string {
  const esc = (s?: string) => (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const linhas = entidades.map(e => {
    const campos: string[] = [
      `cnpj: '${e.cnpj}'`,
      `razaoSocial: '${esc(e.razaoSocial)}'`,
      `municipio: '${esc(e.municipio)}'`,
      `uf: '${e.uf}'`,
    ];
    if (e.codigoIbge) campos.push(`codigoIbge: '${e.codigoIbge}'`);
    if (e.lat !== undefined) campos.push(`lat: ${e.lat.toFixed(4)}`);
    if (e.lng !== undefined) campos.push(`lng: ${e.lng.toFixed(4)}`);
    campos.push(`situacaoCadastral: '${esc(e.situacaoCadastral)}'`);
    if (e.dataInicioAtividade) campos.push(`dataInicioAtividade: '${e.dataInicioAtividade}'`);
    if (e.atividadePrincipal) campos.push(`atividadePrincipal: '${esc(e.atividadePrincipal)}'`);
    if (e.email) campos.push(`email: '${esc(e.email)}'`);
    if (e.telefone) campos.push(`telefone: '${esc(e.telefone)}'`);
    if (e.sigla) campos.push(`sigla: '${esc(e.sigla)}'`);
    if (e.fundacao) campos.push(`fundacao: '${e.fundacao}'`);
    campos.push(`isCDEN: ${e.isCDEN}`);
    campos.push(`isPrecursora: ${e.isPrecursora}`);
    campos.push(`fonteLocalizacao: '${e.fonteLocalizacao}'`);
    return `  { ${campos.join(', ')} },`;
  });

  return `// Gerado automaticamente por scripts/buildEntidadesCadastro.ts — NÃO EDITAR MANUALMENTE
// Cadastro central de entidades: CNPJ → dados oficiais (Receita Federal + IBGE)
// Total: ${entidades.length} entidades

export type SituacaoCadastral = 'ATIVA' | 'BAIXADA' | 'SUSPENSA' | 'INAPTA' | 'NULA' | 'DESCONHECIDA';
export type FonteLocalizacao  = 'RF' | 'Gemini' | 'Indeterminado';

export interface EntidadeCadastro {
  cnpj: string;
  razaoSocial: string;
  municipio: string;
  uf: string;
  codigoIbge?: string;
  lat?: number;
  lng?: number;
  situacaoCadastral: string;
  dataInicioAtividade?: string;
  atividadePrincipal?: string;
  email?: string;
  telefone?: string;
  sigla?: string;
  fundacao?: string;
  isCDEN: boolean;
  isPrecursora: boolean;
  fonteLocalizacao: FonteLocalizacao;
}

const ENTIDADES_CADASTRO: EntidadeCadastro[] = [
${linhas.join('\n')}
];

export const entidadesCadastroMap = new Map<string, EntidadeCadastro>(
  ENTIDADES_CADASTRO.map(e => [e.cnpj, e])
);

const normCNPJ = (cnpj: string) => cnpj.replace(/\\D/g, '').padStart(14, '0');

export function getEntidadeByCNPJ(cnpj: string): EntidadeCadastro | undefined {
  return entidadesCadastroMap.get(normCNPJ(cnpj));
}

export function getEntidadesCadastro(): EntidadeCadastro[] {
  return ENTIDADES_CADASTRO;
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== buildEntidadesCadastro.ts ===\n');

  // 1. Coleta todos os CNPJs
  console.log('1. Coletando CNPJs de todas as fontes…');
  const fontes = coletarCNPJs();
  console.log(`   ${fontes.size} entidades únicas encontradas.\n`);

  // 2. Inicializa Gemini
  const apiKey = loadEnvKey();
  const ai = new GoogleGenAI({ apiKey });

  // 3. Para cada CNPJ: RF → Gemini fallback → IBGE coords
  const resultado: EntidadeCadastro[] = [];
  let rfOk = 0, geminiOk = 0, indeterminado = 0;
  const total = fontes.size;
  let idx = 0;

  for (const [cnpj, source] of fontes) {
    idx++;
    process.stdout.write(`  [${idx}/${total}] ${cnpj} ${source.nome.slice(0, 40)}… `);

    let municipio = '';
    let uf = '';
    let ibgeId = '';
    let situacao = 'DESCONHECIDA';
    let dataInicio: string | undefined;
    let atividade: string | undefined;
    let email: string | undefined;
    let telefone: string | undefined;
    let fonte: 'RF' | 'Gemini' | 'Indeterminado' = 'Indeterminado';
    let razaoSocial = source.nome;

    const rf = await fetchRF(cnpj);
    await sleep(DELAY_RF);

    if (rf) {
      municipio = rf.municipio;
      uf = rf.uf;
      ibgeId = rf.ibgeId;
      situacao = rf.situacaoCadastral;
      dataInicio = rf.dataInicioAtividade;
      atividade = rf.atividadePrincipal;
      email = rf.email;
      telefone = rf.telefone;
      razaoSocial = rf.razaoSocial || source.nome;
      fonte = 'RF';
      rfOk++;
      process.stdout.write(`RF ✓ ${municipio}/${uf}\n`);
    } else {
      // Fallback Gemini
      const gem = await fallbackGemini(ai, source.nome, source.estado);
      if (gem) {
        municipio = gem.municipio;
        uf = gem.uf;
        fonte = 'Gemini';
        geminiOk++;
        process.stdout.write(`Gemini ✓ ${municipio}/${uf}\n`);
      } else {
        indeterminado++;
        process.stdout.write(`✗ indeterminado\n`);
      }
    }

    // Coordenadas IBGE
    let lat: number | undefined;
    let lng: number | undefined;

    if (ibgeId) {
      const coords = await fetchCentroid(ibgeId);
      await sleep(DELAY_IBGE);
      if (coords) {
        [lat, lng] = coords;
      }
    }

    resultado.push({
      cnpj,
      razaoSocial,
      municipio,
      uf,
      codigoIbge: ibgeId || undefined,
      lat,
      lng,
      situacaoCadastral: situacao,
      dataInicioAtividade: dataInicio,
      atividadePrincipal: atividade,
      email,
      telefone,
      sigla: source.sigla,
      fundacao: source.fundacao,
      isCDEN: source.isCDEN,
      isPrecursora: source.isPrecursora,
      fonteLocalizacao: fonte,
    });
  }

  // 4. Escreve o arquivo
  console.log(`\n4. Gerando ${OUT_TS}…`);
  const content = gerarTS(resultado);
  writeFileSync(OUT_TS, content, 'utf-8');

  console.log('\n=== Concluído ===');
  console.log(`Total entidades:      ${resultado.length}`);
  console.log(`Receita Federal (RF): ${rfOk}`);
  console.log(`Gemini fallback:      ${geminiOk}`);
  console.log(`Indeterminados:       ${indeterminado}`);
  console.log(`CDEN:                 ${resultado.filter(e => e.isCDEN).length}`);
  console.log(`Precursoras:          ${resultado.filter(e => e.isPrecursora).length}`);
  console.log(`Ativas:               ${resultado.filter(e => e.situacaoCadastral === 'ATIVA').length}`);
}

main().catch(e => { console.error('\n✗ Erro fatal:', e); process.exit(1); });
