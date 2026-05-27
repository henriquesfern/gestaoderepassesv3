import { readFile } from 'fs/promises';
import path from 'path';
import type { EntidadeSelecionada } from '../src/types';
import { parseData } from '../src/data/parser';
import { carregarDadosVivosLegacyView } from '../src/data/dados-vivos';

type ListaLegada = 'fomento2026' | 'fomentoHistorico' | 'patrocinioHistorico';

interface DivergenciaAdapter {
  lista: ListaLegada;
  chave: string;
  campo: string;
  legado: unknown;
  dadosVivos: unknown;
}

function normalizarCnpj(cnpj: unknown): string {
  return String(cnpj ?? '').replace(/\D/g, '');
}

function normalizarTexto(valor: unknown): string {
  return String(valor ?? '').trim();
}

function chaveItem(item: EntidadeSelecionada): string {
  return `${normalizarCnpj(item.CNPJ)}::${normalizarTexto(item.SEI).toLowerCase()}`;
}

function indexarPorChave(lista: EntidadeSelecionada[]): Map<string, EntidadeSelecionada> {
  return new Map(lista.map((item) => [chaveItem(item), item]));
}

function valoresNumericosEquivalentes(a: unknown, b: unknown): boolean {
  const numeroA = Number(a ?? 0);
  const numeroB = Number(b ?? 0);
  return Math.abs(numeroA - numeroB) <= 0.01;
}

function valoresTextoEquivalentes(a: unknown, b: unknown): boolean {
  return normalizarTexto(a) === normalizarTexto(b);
}

function compararCampo(params: {
  divergencias: DivergenciaAdapter[];
  lista: ListaLegada;
  chave: string;
  campo: keyof EntidadeSelecionada;
  legado: EntidadeSelecionada;
  dadosVivos: EntidadeSelecionada;
  tipo: 'texto' | 'numero' | 'booleano';
}): void {
  const { divergencias, lista, chave, campo, legado, dadosVivos, tipo } = params;
  const valorLegado = legado[campo];
  const valorDadosVivos = dadosVivos[campo];

  const equivalente =
    tipo === 'numero'
      ? valoresNumericosEquivalentes(valorLegado, valorDadosVivos)
      : tipo === 'booleano'
        ? Boolean(valorLegado) === Boolean(valorDadosVivos)
        : valoresTextoEquivalentes(valorLegado, valorDadosVivos);

  if (!equivalente) {
    divergencias.push({
      lista,
      chave,
      campo,
      legado: valorLegado,
      dadosVivos: valorDadosVivos,
    });
  }
}

function compararLista(
  lista: ListaLegada,
  legado: EntidadeSelecionada[],
  dadosVivos: EntidadeSelecionada[],
): DivergenciaAdapter[] {
  const divergencias: DivergenciaAdapter[] = [];
  const legadoPorChave = indexarPorChave(legado);
  const dadosVivosPorChave = indexarPorChave(dadosVivos);

  if (legado.length !== dadosVivos.length) {
    divergencias.push({
      lista,
      chave: 'contagem',
      campo: 'length',
      legado: legado.length,
      dadosVivos: dadosVivos.length,
    });
  }

  for (const [chave, itemLegado] of legadoPorChave) {
    const itemDadosVivos = dadosVivosPorChave.get(chave);

    if (!itemDadosVivos) {
      divergencias.push({
        lista,
        chave,
        campo: 'CNPJ',
        legado: itemLegado.CNPJ,
        dadosVivos: 'ausente',
      });
      continue;
    }

    for (const campo of ['ENTIDADE', 'ESTADO', 'SEI', 'FISCAL'] as const) {
      compararCampo({
        divergencias,
        lista,
        chave,
        campo,
        legado: itemLegado,
        dadosVivos: itemDadosVivos,
        tipo: 'texto',
      });
    }

    for (const campo of ['NOTA', 'VALOR_REPASSE', 'VALOR_PROJETO'] as const) {
      compararCampo({
        divergencias,
        lista,
        chave,
        campo,
        legado: itemLegado,
        dadosVivos: itemDadosVivos,
        tipo: 'numero',
      });
    }

    for (const campo of ['IsCDEN', 'IsPrecursora'] as const) {
      compararCampo({
        divergencias,
        lista,
        chave,
        campo,
        legado: itemLegado,
        dadosVivos: itemDadosVivos,
        tipo: 'booleano',
      });
    }
  }

  for (const [chave, itemDadosVivos] of dadosVivosPorChave) {
    if (!legadoPorChave.has(chave)) {
      divergencias.push({
        lista,
        chave,
        campo: 'CNPJ',
        legado: 'ausente',
        dadosVivos: itemDadosVivos.CNPJ,
      });
    }
  }

  return divergencias;
}

async function comFetchLocal<T>(acao: () => Promise<T>): Promise<T> {
  const publicDataDir = path.resolve(process.cwd(), 'public', 'data');
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (target.startsWith('/data/')) {
      const fileName = target.replace('/data/', '');
      const text = await readFile(path.join(publicDataDir, fileName), 'utf8');
      return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    return originalFetch(input as never, init);
  };

  try {
    return await acao();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function main(): Promise<void> {
  const legado = await comFetchLocal(parseData);
  const dadosVivos = carregarDadosVivosLegacyView();

  const divergencias = [
    ...compararLista('fomento2026', legado.fomento2026, dadosVivos.fomento2026),
    ...compararLista('fomentoHistorico', legado.fomentoHistorico, dadosVivos.fomentoHistorico),
    ...compararLista('patrocinioHistorico', legado.patrocinioHistorico, dadosVivos.patrocinioHistorico),
  ];

  if (divergencias.length > 0) {
    console.error(`Adapter de dados vivos com ${divergencias.length} divergencia(s) critica(s).`);

    for (const divergencia of divergencias.slice(0, 20)) {
      console.error(
        `- ${divergencia.lista} ${divergencia.chave} ${divergencia.campo}: legado=${JSON.stringify(divergencia.legado)} dadosVivos=${JSON.stringify(divergencia.dadosVivos)}`,
      );
    }

    throw new Error('VALIDACAO_DADOS_VIVOS_ADAPTER');
  }

  console.log('Adapter de compatibilidade dos dados vivos validado com sucesso.');
  console.log(`Fomento 2026: ${dadosVivos.fomento2026.length}`);
  console.log(`Fomento historico: ${dadosVivos.fomentoHistorico.length}`);
  console.log(`Patrocinio historico: ${dadosVivos.patrocinioHistorico.length}`);
}

main();
