/**
 * Fase A — Inferência de CNPJ para entidades do ECGeral.ts via Gemini + RF
 *
 * Execução em lotes com checkpoint (retomável).
 * Gera dois artefatos de revisão:
 *   scripts/ecgeral-output/ecgeral_candidatos.json  — lista completa com flag aprovado
 *   scripts/ecgeral-output/ecgeral_revisao.md        — documento de revisão organizado por confiança
 *
 * Uso:
 *   npx tsx scripts/enrichECGeral.ts           # processa todos
 *   npx tsx scripts/enrichECGeral.ts --batch=50 # processa próximos 50
 *   npx tsx scripts/enrichECGeral.ts --reset     # reinicia do zero
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { GoogleGenAI } from '@google/genai';

const CHECKPOINT_PATH = resolve('scripts/ecgeral-output/ecgeral_checkpoint.json');
const CANDIDATOS_PATH = resolve('scripts/ecgeral-output/ecgeral_candidatos.json');
const REVISAO_PATH    = resolve('scripts/ecgeral-output/ecgeral_revisao.md');
const DELAY_RF   = 360;
const DELAY_GEM  = 800;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Tipos ──────────────────────────────────────────────────────────────────────

type Confianca = 'Alta' | 'Média' | 'Baixa' | 'Não encontrado';
type Aprovado  = true | false | null;  // true=aprovado, false=rejeitado, null=pendente revisão

interface Candidato {
  sigla: string;
  denominacao: string;
  origem: string;
  tipo: string;
  uf_crea: string;
  cnpj_sugerido: string | null;
  razao_social_rf: string | null;
  municipio_rf: string | null;
  uf_rf: string | null;
  situacao_rf: string | null;
  similaridade_nome: number;
  confianca: Confianca;
  aprovado: Aprovado;
  observacao: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const normCNPJ = (s: string) => s.replace(/\D/g, '').padStart(14, '0');

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

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const STOPWORDS = new Set([
  'associacao','dos','das','do','da','de','e','a','o','em','no','na',
  'engenheiros','arquitetos','agronomos','agronomia','engenharia',
  'arquitetura','regional','brasileira','brasileiro','brasil','nacional',
  'profissional','profissionais','tecnicos','tecnologos','gelogos',
  'instituto','sociedade','clube','federacao','sindicato','conselho',
  'associacao','fundacao','centro','uniao','liga','nucleo','secao',
  'departamento','capitulo','representacao','grupo','entidade',
]);

function calcularSimilaridade(a: string, b: string): number {
  const tokensA = normalizar(a).split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));
  const tokensB = normalizar(b).split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersecao = [...setA].filter(t => setB.has(t)).length;
  return intersecao / Math.max(setA.size, setB.size);
}

function ufDoCrea(origem: string): string {
  const m = origem.match(/Crea-([A-Z]{2})/i);
  return m ? m[1].toUpperCase() : '';
}

function calcularConfianca(c: Candidato): Confianca {
  if (!c.cnpj_sugerido || !c.razao_social_rf) return 'Não encontrado';
  const ufOk = c.uf_crea && c.uf_rf ? c.uf_crea === c.uf_rf : false;
  const sim   = c.similaridade_nome;
  if (ufOk && sim >= 0.5) return 'Alta';
  if (ufOk || sim >= 0.35) return 'Média';
  return 'Baixa';
}

function aprovadoInicial(c: Confianca): Aprovado {
  if (c === 'Alta') return true;
  if (c === 'Não encontrado') return false;
  return null; // Média e Baixa aguardam revisão
}

// ── ECGeral parser ─────────────────────────────────────────────────────────────

interface ECEntry {
  sigla: string;
  denominacao: string;
  origem: string;
  tipo: string;
}

function parseECGeral(): ECEntry[] {
  const content = readFileSync(resolve('src/data/ECGeral.ts'), 'utf-8');
  const csvMatch = content.match(/const rawCsv = `([\s\S]*?)`;/);
  if (!csvMatch) throw new Error('rawCsv não encontrado em ECGeral.ts');
  const lines = csvMatch[1].split('\n').slice(1); // pula header
  const entries: ECEntry[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(';');
    if (parts.length < 7) continue;
    const tipo  = (parts[4] || '').trim();
    const sigla = (parts[5] || '').trim();
    const denom = (parts[6] || '').trim().replace(/^"|"$/g, '').replace(/\n.*/, '');
    const orig  = (parts[2] || '').trim();
    if ((tipo === 'EC' || tipo === 'IES') && denom && sigla) {
      entries.push({ sigla, denominacao: denom, origem: orig, tipo });
    }
  }
  return entries;
}

// ── API Receita Federal ────────────────────────────────────────────────────────

async function fetchRF(cnpj: string): Promise<{ razaoSocial: string; municipio: string; uf: string; situacao: string } | null> {
  try {
    const resp = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    if (!resp.ok) return null;
    const d = await resp.json() as any;
    const est = d?.estabelecimento;
    const cidade = est?.cidade?.nome;
    const uf     = est?.estado?.sigla;
    if (!cidade || !uf) return null;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return {
      razaoSocial: (d.razao_social || '').trim(),
      municipio: cidade.split(' ').map((w: string, i: number) => i === 0 ? cap(w) : w).join(' '),
      uf,
      situacao: (est?.situacao_cadastral || 'Desconhecida').trim(),
    };
  } catch { return null; }
}

// ── Gemini inference ──────────────────────────────────────────────────────────

async function inferirCNPJ(
  ai: GoogleGenAI, sigla: string, denominacao: string, origem: string
): Promise<{ cnpj: string | null; observacao: string }> {
  const prompt = `Você conhece entidades de classe de engenharia brasileiras registradas no Sistema Confea/Crea.
Identifique o CNPJ desta entidade:

Sigla: ${sigla}
Nome: ${denominacao}
CREA de origem: ${origem}

Retorne SOMENTE JSON válido (sem markdown):
{"cnpj": "CNPJ com 14 dígitos sem formatação ou null se não souber", "observacao": "breve justificativa"}`;

  try {
    const r = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const parsed = extrairJson(r.text ?? '') as any;
    if (parsed?.cnpj) {
      const cnpj = normCNPJ(String(parsed.cnpj));
      if (cnpj.length === 14 && cnpj !== '00000000000000') {
        return { cnpj, observacao: parsed.observacao || '' };
      }
    }
  } catch { /* ignorar */ }
  return { cnpj: null, observacao: 'Gemini não retornou CNPJ válido' };
}

// ── Geração do documento de revisão ───────────────────────────────────────────

function gerarRevisao(candidatos: Candidato[]): string {
  const alta   = candidatos.filter(c => c.confianca === 'Alta');
  const media  = candidatos.filter(c => c.confianca === 'Média');
  const baixa  = candidatos.filter(c => c.confianca === 'Baixa');
  const naoEnc = candidatos.filter(c => c.confianca === 'Não encontrado');

  const tbl = (rows: Candidato[], showAprovado = false) => {
    const header = showAprovado
      ? '| Sigla | Nome | CREA | CNPJ | Razão Social RF | Município/UF | Situação | Aprovado |'
      : '| Sigla | Nome | CREA | CNPJ | Razão Social RF | Município/UF | Situação | Observação |';
    const sep = showAprovado
      ? '|---|---|---|---|---|---|---|---|'
      : '|---|---|---|---|---|---|---|---|';
    const lines = rows.map(c => {
      const cnpj = c.cnpj_sugerido
        ? c.cnpj_sugerido.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        : '—';
      const ap = c.aprovado === true ? '✅' : c.aprovado === false ? '❌' : '⏳';
      const rs  = (c.razao_social_rf || '—').slice(0, 50);
      const mun = c.municipio_rf && c.uf_rf ? `${c.municipio_rf}/${c.uf_rf}` : '—';
      if (showAprovado) return `| ${c.sigla} | ${c.denominacao.slice(0,50)} | ${c.origem} | \`${cnpj}\` | ${rs} | ${mun} | ${c.situacao_rf || '—'} | ${ap} |`;
      return `| ${c.sigla} | ${c.denominacao.slice(0,50)} | ${c.origem} | \`${cnpj}\` | ${rs} | ${mun} | ${c.situacao_rf || '—'} | ${c.observacao.slice(0,40)} |`;
    });
    return [header, sep, ...lines].join('\n');
  };

  const total = candidatos.length;
  const processados = candidatos.filter(c => c.confianca !== 'Não encontrado' || c.cnpj_sugerido).length;

  return `# Revisão ECGeral — Correspondências CNPJ

**Gerado:** ${new Date().toLocaleDateString('pt-BR')}
**Total ECGeral processados:** ${candidatos.length} de ~968
**Alta confiança:** ${alta.length} (aprovação automática)
**Média confiança:** ${media.length} (⏳ revisão recomendada)
**Baixa confiança:** ${baixa.length} (⏳ revisão obrigatória)
**Não encontrado:** ${naoEnc.length} (❌ descarte ou revisão manual)

---

## Como usar este documento

1. **Alta** — entradas pré-aprovadas (\`aprovado: true\`). Revise se quiser confirmar.
2. **Média/Baixa** — abra \`ecgeral_candidatos.json\` e defina \`"aprovado": true\` ou \`false\` para cada entrada.
3. **Não encontrado** — CNPJ não identificado. Pode ignorar ou adicionar manualmente ao JSON.
4. Quando terminar: execute \`npx tsx scripts/importECGeralValidados.ts\`.

---

## ✅ Alta Confiança — ${alta.length} entidades (pré-aprovadas)

${alta.length > 0 ? tbl(alta) : '_Nenhuma entrada de alta confiança ainda._'}

---

## ⚠️ Média Confiança — ${media.length} entidades (revisão recomendada)

${media.length > 0 ? tbl(media, true) : '_Nenhuma entrada de média confiança ainda._'}

---

## 🔍 Baixa Confiança — ${baixa.length} entidades (revisão obrigatória)

${baixa.length > 0 ? tbl(baixa, true) : '_Nenhuma entrada de baixa confiança ainda._'}

---

## ❌ Não encontrado — ${naoEnc.length} entidades

${naoEnc.length > 0 ? tbl(naoEnc, true) : '_Nenhuma entrada não encontrada._'}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const batchArg = args.find(a => a.startsWith('--batch='));
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : 968;
  const reset = args.includes('--reset');

  console.log('=== enrichECGeral.ts ===\n');

  // Carrega ECGeral
  const entries = parseECGeral();
  console.log(`ECGeral entries lidas: ${entries.length}`);

  // Carrega checkpoint
  let candidatos: Candidato[] = [];
  if (!reset && existsSync(CHECKPOINT_PATH)) {
    candidatos = JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf-8'));
    console.log(`Checkpoint encontrado: ${candidatos.length} já processados`);
  } else {
    if (reset) console.log('Reiniciando do zero.');
  }

  // Identifica processados
  const processadosSiglas = new Set(candidatos.map(c => `${c.sigla}|${c.denominacao.slice(0, 20)}`));
  const pendentes = entries.filter(e => !processadosSiglas.has(`${e.sigla}|${e.denominacao.slice(0, 20)}`));
  const aProcessar = pendentes.slice(0, batchSize);

  console.log(`Pendentes: ${pendentes.length} | Este lote: ${aProcessar.length}\n`);

  if (aProcessar.length === 0) {
    console.log('Nada a processar. Gerando documentos de revisão…');
  } else {
    const apiKey = loadEnvKey();
    const ai = new GoogleGenAI({ apiKey });

    for (let i = 0; i < aProcessar.length; i++) {
      const e = aProcessar[i];
      const uf = ufDoCrea(e.origem);
      process.stdout.write(`  [${i+1}/${aProcessar.length}] ${e.sigla} — ${e.denominacao.slice(0,40)}… `);

      // Gemini
      const { cnpj, observacao } = await inferirCNPJ(ai, e.sigla, e.denominacao, e.origem);
      await sleep(DELAY_GEM);

      // RF
      let rfData = null;
      if (cnpj) {
        rfData = await fetchRF(cnpj);
        await sleep(DELAY_RF);
      }

      const sim = rfData ? calcularSimilaridade(e.denominacao, rfData.razaoSocial) : 0;
      const candidato: Candidato = {
        sigla: e.sigla,
        denominacao: e.denominacao,
        origem: e.origem,
        tipo: e.tipo,
        uf_crea: uf,
        cnpj_sugerido: cnpj,
        razao_social_rf: rfData?.razaoSocial ?? null,
        municipio_rf: rfData?.municipio ?? null,
        uf_rf: rfData?.uf ?? null,
        situacao_rf: rfData?.situacao ?? null,
        similaridade_nome: parseFloat(sim.toFixed(2)),
        confianca: 'Baixa',
        aprovado: null,
        observacao,
      };
      candidato.confianca = calcularConfianca(candidato);
      candidato.aprovado  = aprovadoInicial(candidato.confianca);

      candidatos.push(candidato);
      process.stdout.write(`${candidato.confianca} (sim=${sim.toFixed(2)}) ${cnpj ? cnpj : '—'}\n`);

      // Salva checkpoint a cada 10
      if ((i + 1) % 10 === 0) {
        writeFileSync(CHECKPOINT_PATH, JSON.stringify(candidatos, null, 2), 'utf-8');
      }
    }

    writeFileSync(CHECKPOINT_PATH, JSON.stringify(candidatos, null, 2), 'utf-8');
  }

  // Gera artefatos de revisão
  console.log('\nGerando artefatos de revisão…');
  writeFileSync(CANDIDATOS_PATH, JSON.stringify(candidatos, null, 2), 'utf-8');
  writeFileSync(REVISAO_PATH, gerarRevisao(candidatos), 'utf-8');

  // Resumo
  const alta   = candidatos.filter(c => c.confianca === 'Alta').length;
  const media  = candidatos.filter(c => c.confianca === 'Média').length;
  const baixa  = candidatos.filter(c => c.confianca === 'Baixa').length;
  const naoEnc = candidatos.filter(c => c.confianca === 'Não encontrado').length;
  const pendentesRevisao = candidatos.filter(c => c.aprovado === null).length;

  console.log('\n=== Resumo ===');
  console.log(`Processados: ${candidatos.length}/${entries.length}`);
  console.log(`Alta:         ${alta}  (pré-aprovados)`);
  console.log(`Média:        ${media}  (revisão recomendada)`);
  console.log(`Baixa:        ${baixa}  (revisão obrigatória)`);
  console.log(`Não encontrado: ${naoEnc}`);
  console.log(`Pendentes de revisão: ${pendentesRevisao}`);
  console.log(`\nArtefatos gerados:`);
  console.log(`  ${CANDIDATOS_PATH}`);
  console.log(`  ${REVISAO_PATH}`);

  if (pendentes.length > aProcessar.length) {
    console.log(`\n⏳ Restam ${pendentes.length - aProcessar.length} entidades. Execute novamente para continuar.`);
  } else {
    console.log('\n✅ Processamento completo. Revise ecgeral_revisao.md e execute importECGeralValidados.ts quando pronto.');
  }
}

main().catch(e => { console.error('\n✗ Erro fatal:', e); process.exit(1); });
