/**
 * Fase C — Importa para entidadesCadastro.ts as entradas aprovadas de ecgeral_candidatos.json
 *
 * Lê scripts/ecgeral-output/ecgeral_candidatos.json
 * Filtra aprovado === true
 * Busca dados frescos na RF para cada aprovado
 * Appenda ao entidadesCadastro.ts
 *
 * Uso:
 *   npx tsx scripts/importECGeralValidados.ts           # dry-run (mostra o que faria)
 *   npx tsx scripts/importECGeralValidados.ts --apply   # aplica de fato
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EntidadeCadastro } from '../src/data/entidadesCadastro';

const CANDIDATOS_PATH = resolve('scripts/ecgeral-output/ecgeral_candidatos.json');
const OUT_TS = resolve('src/data/entidadesCadastro.ts');
const DELAY = 380;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const normCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');

// ── API Receita Federal ────────────────────────────────────────────────────────

async function fetchRF(cnpj: string) {
  try {
    const resp = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    if (!resp.ok) return null;
    const d = await resp.json() as any;
    const est = d?.estabelecimento;
    const cidade = est?.cidade?.nome;
    const uf     = est?.estado?.sigla;
    const ibgeId = String(est?.cidade?.ibge_id ?? '');
    if (!cidade || !uf) return null;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const lower = new Set(['de','da','do','das','dos','e','a','o']);
    const municipio = cidade.split(' ').map((w: string, i: number) =>
      i === 0 || !lower.has(w.toLowerCase()) ? cap(w) : w.toLowerCase()
    ).join(' ');
    return {
      razaoSocial: (d.razao_social || '').trim(),
      municipio, uf, ibgeId,
      situacaoCadastral: (est?.situacao_cadastral || 'DESCONHECIDA').trim(),
      dataInicioAtividade: est?.data_inicio_atividade || undefined,
      atividadePrincipal: est?.atividade_principal?.descricao || undefined,
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

// ── Serialização ───────────────────────────────────────────────────────────────

function esc(s?: string) { return (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

function serializarEntrada(e: EntidadeCadastro): string {
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
  if (e.atividadePrincipal)  campos.push(`atividadePrincipal: '${esc(e.atividadePrincipal)}'`);
  if (e.sigla)    campos.push(`sigla: '${esc(e.sigla)}'`);
  if (e.fundacao) campos.push(`fundacao: '${e.fundacao}'`);
  campos.push(`isCDEN: ${e.isCDEN}`);
  campos.push(`isPrecursora: ${e.isPrecursora}`);
  campos.push(`fonteLocalizacao: '${e.fonteLocalizacao}'`);
  return `  { ${campos.join(', ')} },`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`=== importECGeralValidados.ts ${apply ? '(APLICANDO)' : '(dry-run — use --apply para aplicar)'} ===\n`);

  if (!existsSync(CANDIDATOS_PATH)) {
    console.error(`Arquivo não encontrado: ${CANDIDATOS_PATH}`);
    console.error('Execute primeiro: npx tsx scripts/enrichECGeral.ts');
    process.exit(1);
  }

  const candidatos = JSON.parse(readFileSync(CANDIDATOS_PATH, 'utf-8')) as Array<{
    sigla: string; denominacao: string; cnpj_sugerido: string | null;
    confianca: string; aprovado: boolean | null; observacao: string;
    uf_crea: string; tipo: string;
  }>;

  const aprovados = candidatos.filter(c => c.aprovado === true && c.cnpj_sugerido);
  const pendentes = candidatos.filter(c => c.aprovado === null).length;

  console.log(`Total candidatos: ${candidatos.length}`);
  console.log(`Aprovados: ${aprovados.length}`);
  console.log(`Pendentes de revisão: ${pendentes}`);

  if (pendentes > 0) {
    console.log(`\n⚠️  ${pendentes} entradas ainda aguardam revisão (aprovado: null).`);
    console.log('   Abra ecgeral_candidatos.json e defina "aprovado": true ou false para cada uma.');
    if (!apply) console.log('\nExecute com --apply apenas após concluir a revisão.');
  }

  if (aprovados.length === 0) {
    console.log('\nNenhum aprovado para importar.');
    return;
  }

  // Verifica CNPJs já no cadastro
  const tsContent = readFileSync(OUT_TS, 'utf-8');
  const existentes = new Set([...tsContent.matchAll(/cnpj: '(\d{14})'/g)].map(m => m[1]));
  const novos = aprovados.filter(c => !existentes.has(normCNPJ(c.cnpj_sugerido!)));

  console.log(`\nJá no cadastro: ${aprovados.length - novos.length}`);
  console.log(`Novos para adicionar: ${novos.length}`);

  if (novos.length === 0) {
    console.log('\nTodos os aprovados já estão no cadastro.');
    return;
  }

  if (!apply) {
    console.log('\nPrévia dos primeiros 5:');
    novos.slice(0, 5).forEach(c =>
      console.log(`  ${c.sigla} | ${c.denominacao.slice(0,50)} | CNPJ: ${c.cnpj_sugerido}`)
    );
    console.log('\nExecute com --apply para incorporar ao entidadesCadastro.ts');
    return;
  }

  // Busca dados frescos e incorpora
  const novasEntradas: EntidadeCadastro[] = [];
  for (let i = 0; i < novos.length; i++) {
    const c = novos[i];
    const cnpj = normCNPJ(c.cnpj_sugerido!);
    process.stdout.write(`  [${i+1}/${novos.length}] ${cnpj} ${c.sigla}… `);

    const rf = await fetchRF(cnpj);
    await sleep(DELAY);

    let lat: number | undefined, lng: number | undefined;
    if (rf?.ibgeId) {
      const coords = await fetchCentroid(rf.ibgeId);
      if (coords) [lat, lng] = coords;
      await sleep(300);
    }

    novasEntradas.push({
      cnpj,
      razaoSocial: rf?.razaoSocial || c.denominacao,
      municipio: rf?.municipio || '',
      uf: rf?.uf || c.uf_crea,
      codigoIbge: rf?.ibgeId || undefined,
      lat, lng,
      situacaoCadastral: rf?.situacaoCadastral || 'DESCONHECIDA',
      dataInicioAtividade: rf?.dataInicioAtividade,
      atividadePrincipal: rf?.atividadePrincipal,
      sigla: c.sigla,
      isCDEN: false,
      isPrecursora: false,
      fonteLocalizacao: rf ? 'RF' : 'Gemini',
    });

    process.stdout.write(`${rf ? `RF ✓ ${rf.municipio}/${rf.uf}` : 'RF ✗ (Gemini)'}\n`);
  }

  // Insere no cadastro.ts
  const linhas = [
    `  // ECGeral — adicionado por importECGeralValidados.ts`,
    ...novasEntradas.map(serializarEntrada),
  ].join('\n');

  const atualizado = tsContent.replace(/\r\n/g, '\n').replace(
    /\];\nexport const entidadesCadastroMap/,
    `${linhas}\n];\nexport const entidadesCadastroMap`
  );
  writeFileSync(OUT_TS, atualizado, 'utf-8');

  console.log(`\n✅ ${novasEntradas.length} entidades adicionadas ao entidadesCadastro.ts`);
  console.log('Execute npx tsc --noEmit para verificar tipagem e depois sincronize.');
}

main().catch(e => { console.error('\n✗ Erro:', e); process.exit(1); });
