/**
 * Atualiza entidadesCadastro.ts em dois passos:
 *   1. Re-tenta RF API para as entidades com situacaoCadastral = 'DESCONHECIDA'
 *   2. Adiciona as entidades CDEN e Precursoras que ainda não estão no cadastro
 *
 * Uso:
 *   npx tsx scripts/refreshEntidadesCadastro.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';
import type { EntidadeCadastro } from '../src/data/entidadesCadastro';

const OUT_TS   = resolve('src/data/entidadesCadastro.ts');
const DELAY_RF = 380;
const DELAY_IBGE = 320;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── helpers ───────────────────────────────────────────────────────────────────

const normCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');
const SEP = '\x5cr\x5cn'; // literal \r\n de arquivos TS

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

// ── Extração de CNPJs de cden.ts e precursoras.ts ────────────────────────────

function extrairCNPJsTS(filepath: string, campoIdx: number): Map<string, string> {
  const content = readFileSync(filepath, 'utf-8');
  const csvMatch = content.match(/= "(.*?)";/s);
  if (!csvMatch) return new Map();
  const rows = csvMatch[1].split(SEP);
  const result = new Map<string, string>();
  rows.slice(1).forEach(row => {
    const parts = row.trim().split(',');
    if (parts.length <= campoIdx) return;
    const cnpj = normCNPJ(parts[campoIdx]);
    if (cnpj.length !== 14) return;
    const nomeIdx = campoIdx === 0 ? 1 : 0;
    const nome = (parts[nomeIdx] ?? '').trim();
    result.set(cnpj, nome);
  });
  return result;
}

// ── API Receita Federal ────────────────────────────────────────────────────────

interface RFData {
  razaoSocial: string; municipio: string; uf: string; ibgeId: string;
  situacaoCadastral: string; dataInicioAtividade?: string;
  atividadePrincipal?: string; email?: string; telefone?: string;
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
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const titleCity = cidade.split(' ').map((w: string, i: number) => {
      const lower = new Set(['de','da','do','das','dos','e','a','o']);
      return i === 0 || !lower.has(w.toLowerCase()) ? cap(w) : w.toLowerCase();
    }).join(' ');
    return {
      razaoSocial: (data.razao_social || '').trim(),
      municipio: titleCity,
      uf, ibgeId,
      situacaoCadastral: (est?.situacao_cadastral || 'DESCONHECIDA').trim(),
      dataInicioAtividade: est?.data_inicio_atividade || undefined,
      atividadePrincipal: est?.atividade_principal?.descricao || undefined,
      email: est?.email || undefined,
      telefone: est?.ddd1 && est?.telefone1 ? `(${est.ddd1}) ${est.telefone1}` : undefined,
    };
  } catch { return null; }
}

// ── Centroide IBGE ─────────────────────────────────────────────────────────────

async function fetchCentroid(ibgeId: string): Promise<[number, number] | null> {
  try {
    const url = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${ibgeId}?resolucao=5&formato=application/vnd.geo+json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const geo = await resp.json() as any;
    const ring = geo?.features?.[0]?.geometry?.type === 'Polygon'
      ? geo.features[0].geometry.coordinates[0]
      : geo?.features?.[0]?.geometry?.coordinates?.[0]?.[0];
    if (!ring?.length) return null;
    return [
      ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length,
      ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length,
    ];
  } catch { return null; }
}

// ── Fallback Gemini ────────────────────────────────────────────────────────────

async function fallbackGemini(
  ai: GoogleGenAI, nome: string
): Promise<{ municipio: string; uf: string } | null> {
  const prompt = `Qual é o município sede desta entidade de engenharia brasileira?
Entidade: ${nome}
Retorne SOMENTE JSON: {"municipio": "Nome", "uf": "XX"}
Se não souber: {"municipio": null, "uf": null}`;
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

// ── Geração do arquivo ────────────────────────────────────────────────────────

function serializeEntry(e: EntidadeCadastro): string {
  const esc = (s?: string) => (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== refreshEntidadesCadastro.ts ===\n');

  // Lê cadastro atual e extrai entradas
  const tsContent = readFileSync(OUT_TS, 'utf-8').replace(/\r\n/g, '\n');
  const arrayMatch = tsContent.match(/const ENTIDADES_CADASTRO[^=]+=\s*\[([\s\S]*?)\];\n/);
  if (!arrayMatch) throw new Error('Não encontrou ENTIDADES_CADASTRO no arquivo');

  // Parseia entradas existentes como texto para re-serialização
  const { getEntidadesCadastro } = await import('../src/data/entidadesCadastro.js');
  const entidadesAtuais: EntidadeCadastro[] = getEntidadesCadastro();
  const cadastroMap = new Map(entidadesAtuais.map(e => [e.cnpj, { ...e }]));

  console.log(`Cadastro atual: ${cadastroMap.size} entidades`);

  // Identifica CNPJs DESCONHECIDA
  const desconhecidos = entidadesAtuais
    .filter(e => e.situacaoCadastral === 'DESCONHECIDA')
    .map(e => e.cnpj);
  console.log(`Com situação DESCONHECIDA: ${desconhecidos.length}`);

  // Identifica CNPJs faltantes (CDEN + Precursoras)
  const cdenMap = extrairCNPJsTS('src/data/cden.ts', 1);
  const precMap  = extrairCNPJsTS('src/data/precursoras.ts', 0);
  const faltando = new Map<string, { nome: string; isCDEN: boolean; isPrecursora: boolean }>();
  for (const [cnpj, nome] of cdenMap) {
    if (!cadastroMap.has(cnpj)) faltando.set(cnpj, { nome, isCDEN: true, isPrecursora: false });
  }
  for (const [cnpj, nome] of precMap) {
    if (!cadastroMap.has(cnpj)) {
      const existing = faltando.get(cnpj);
      faltando.set(cnpj, { nome: existing?.nome || nome, isCDEN: existing?.isCDEN ?? false, isPrecursora: true });
    }
  }
  console.log(`CNPJs faltantes (CDEN + Precursoras): ${faltando.size}`);

  const ai = new GoogleGenAI({ apiKey: loadEnvKey() });
  let rfOk = 0, geminiOk = 0, semDados = 0, atualizados = 0, adicionados = 0;
  const total = desconhecidos.length + faltando.size;
  let idx = 0;

  // 1. Re-tenta DESCONHECIDA
  console.log('\n--- Passo 1: Re-tentando RF para DESCONHECIDA ---');
  for (const cnpj of desconhecidos) {
    idx++;
    const entry = cadastroMap.get(cnpj)!;
    process.stdout.write(`  [${idx}/${total}] ${cnpj} ${entry.razaoSocial.slice(0, 35)}… `);

    const rf = await fetchRF(cnpj);
    await sleep(DELAY_RF);

    if (rf) {
      let coords = entry.lat !== undefined ? [entry.lat, entry.lng] as [number, number] : null;
      if (!coords || !entry.codigoIbge) {
        coords = await fetchCentroid(rf.ibgeId);
        await sleep(DELAY_IBGE);
      }
      const updated: EntidadeCadastro = {
        ...entry,
        razaoSocial: rf.razaoSocial || entry.razaoSocial,
        municipio: rf.municipio,
        uf: rf.uf,
        codigoIbge: rf.ibgeId,
        lat: coords?.[0],
        lng: coords?.[1],
        situacaoCadastral: rf.situacaoCadastral,
        dataInicioAtividade: rf.dataInicioAtividade,
        atividadePrincipal: rf.atividadePrincipal,
        email: rf.email,
        telefone: rf.telefone,
        fonteLocalizacao: 'RF',
      };
      cadastroMap.set(cnpj, updated);
      rfOk++; atualizados++;
      process.stdout.write(`RF ✓ ${rf.municipio}/${rf.uf} [${rf.situacaoCadastral}]\n`);
    } else {
      semDados++;
      process.stdout.write(`RF ✗ (mantém DESCONHECIDA)\n`);
    }
  }

  // 2. Adiciona faltantes
  console.log('\n--- Passo 2: Adicionando CDEN e Precursoras faltantes ---');
  for (const [cnpj, { nome, isCDEN, isPrecursora }] of faltando) {
    idx++;
    process.stdout.write(`  [${idx}/${total}] ${cnpj} ${nome.slice(0, 35)}… `);

    const rf = await fetchRF(cnpj);
    await sleep(DELAY_RF);

    let municipio = '', uf = '', ibgeId = '', situacao = 'DESCONHECIDA';
    let dataInicio: string | undefined, atividade: string | undefined;
    let email: string | undefined, telefone: string | undefined;
    let fonte: 'RF' | 'Gemini' | 'Indeterminado' = 'Indeterminado';
    let razaoSocial = nome;
    let lat: number | undefined, lng: number | undefined;

    if (rf) {
      municipio = rf.municipio; uf = rf.uf; ibgeId = rf.ibgeId;
      situacao = rf.situacaoCadastral; dataInicio = rf.dataInicioAtividade;
      atividade = rf.atividadePrincipal; email = rf.email; telefone = rf.telefone;
      razaoSocial = rf.razaoSocial || nome; fonte = 'RF'; rfOk++;
      const coords = await fetchCentroid(ibgeId);
      await sleep(DELAY_IBGE);
      if (coords) [lat, lng] = coords;
      process.stdout.write(`RF ✓ ${municipio}/${uf}\n`);
    } else {
      const gem = await fallbackGemini(ai, nome);
      if (gem) {
        municipio = gem.municipio; uf = gem.uf; fonte = 'Gemini'; geminiOk++;
        process.stdout.write(`Gemini ✓ ${municipio}/${uf}\n`);
      } else {
        semDados++;
        process.stdout.write(`✗ sem dados\n`);
      }
    }

    const sigla = isCDEN
      ? [...(new Map([...Array.from(new Map().entries())])).entries()].find(([k]) => k === cnpj)?.[1]
      : undefined;

    cadastroMap.set(cnpj, {
      cnpj, razaoSocial, municipio, uf,
      codigoIbge: ibgeId || undefined, lat, lng,
      situacaoCadastral: situacao, dataInicioAtividade: dataInicio,
      atividadePrincipal: atividade, email, telefone,
      sigla: undefined, fundacao: undefined,
      isCDEN, isPrecursora, fonteLocalizacao: fonte,
    });
    adicionados++;
  }

  // Gera novo arquivo
  console.log('\nRegenerando entidadesCadastro.ts…');
  const entries = [...cadastroMap.values()].sort((a, b) => a.cnpj.localeCompare(b.cnpj));

  const header = tsContent.split('const ENTIDADES_CADASTRO')[0];
  const footer = tsContent.split(/\];\n\nexport const entidadesCadastroMap/)[1];
  const newContent = header
    + `const ENTIDADES_CADASTRO: EntidadeCadastro[] = [\n`
    + entries.map(serializeEntry).join('\n') + '\n'
    + `];\n\nexport const entidadesCadastroMap` + footer;

  writeFileSync(OUT_TS, newContent, 'utf-8');

  console.log('\n=== Concluído ===');
  console.log(`Total processados:   ${total}`);
  console.log(`RF obtida:           ${rfOk}`);
  console.log(`Gemini fallback:     ${geminiOk}`);
  console.log(`Sem dados:           ${semDados}`);
  console.log(`Situações atualizadas: ${atualizados}`);
  console.log(`Entidades adicionadas: ${adicionados}`);
  console.log(`Total no cadastro:   ${entries.length}`);
  const ativas = entries.filter(e => e.situacaoCadastral.toUpperCase() === 'ATIVA').length;
  console.log(`Situação ATIVA:      ${ativas}`);
}

main().catch(e => { console.error('\n✗ Erro fatal:', e); process.exit(1); });
