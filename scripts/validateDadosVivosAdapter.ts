import { readFile } from 'fs/promises';
import path from 'path';
import type { EntidadeSelecionada } from '../src/types';
import { parseData } from '../src/data/parser';
import { carregarDadosVivosLegacyView } from '../src/data/dados-vivos';

type ListaLegada = 'fomento2026' | 'fomentoHistorico' | 'patrocinioHistorico';
type SeveridadeDivergencia = 'critica' | 'observacional';
type TipoComparacao = 'texto' | 'numero' | 'booleano';

interface DivergenciaAdapter {
  severidade: SeveridadeDivergencia;
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
  return String(valor ?? '').replace(/\u00A0/g, ' ').trim();
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
  severidade: SeveridadeDivergencia;
  lista: ListaLegada;
  chave: string;
  campo: keyof EntidadeSelecionada;
  legado: EntidadeSelecionada;
  dadosVivos: EntidadeSelecionada;
  tipo: TipoComparacao;
}): void {
  const { divergencias, severidade, lista, chave, campo, legado, dadosVivos, tipo } = params;
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
      severidade,
      lista,
      chave,
      campo,
      legado: valorLegado,
      dadosVivos: valorDadosVivos,
    });
  }
}

function compararCampos(params: {
  divergencias: DivergenciaAdapter[];
  severidade: SeveridadeDivergencia;
  lista: ListaLegada;
  chave: string;
  legado: EntidadeSelecionada;
  dadosVivos: EntidadeSelecionada;
  campos: readonly (keyof EntidadeSelecionada)[];
  tipo: TipoComparacao;
}): void {
  const { divergencias, severidade, lista, chave, legado, dadosVivos, campos, tipo } = params;

  for (const campo of campos) {
    compararCampo({
      divergencias,
      severidade,
      lista,
      chave,
      campo,
      legado,
      dadosVivos,
      tipo,
    });
  }
}

function camposDetalhadosTextoPorLista(lista: ListaLegada): readonly (keyof EntidadeSelecionada)[] {
  if (lista === 'fomento2026') {
    return [
      'OBJETIVO',
      'CATEGORIA',
      'tipoRepasse',
      'FISCAL_SUPLENTE',
      'gestao_inicioexecucao',
      'gestao_fimexecucao',
      'gestao_termodefomento',
      'gestao_status',
      'gestao_primeirorepasse',
      'gestao_dataprimeirorepasse',
      'gestao_segundorepasse',
      'gestao_datasegundorepasse',
      'gestao_fiscalsuplente',
      'gestao_situacaofinal',
      'OBJETIVO_COMPLETO',
      'AREA_ABRANGENCIA',
      'OBJETIVO_ESPECIFICO_COMPLETO',
      'PUBLICO_ALVO',
      'OBJETIVO_ESTRATEGICO',
      'TEXTO_NORM',
      'RANKING_ADERENCIA_INFRABR',
      'SCORES',
      'DIMENSAO_PRINCIPAL',
      'TERMOS_DETECTADOS',
      'DIMENSAO_1',
      'DIMENSAO_2',
      'DIMENSAO_3',
      'DIMENSAO_4',
      'DIMENSAO_5',
      'RANKING_COMPONENTES',
      'SCORES_COMPONENTES',
      'RANKING_INDICADORES',
      'SCORES_INDICADORES',
      'TERMOS_COMPONENTES',
      'TERMOS_INDICADORES',
      'COMPONENTE_1',
      'COMPONENTE_2',
      'COMPONENTE_3',
      'COMPONENTE_4',
      'COMPONENTE_5',
      'COMPONENTE_6',
      'COMPONENTE_7',
      'INDICADOR_1',
      'INDICADOR_2',
      'INDICADOR_3',
      'INDICADOR_4',
      'INDICADOR_5',
      'INDICADOR_6',
      'INDICADOR_7',
      'INDICADOR_8',
      'INDICADOR_9',
    ];
  }

  if (lista === 'fomentoHistorico') {
    return ['OBJETIVO', 'CATEGORIA', 'tipoRepasse', 'DATA_INICIO', 'DATA_FIM', 'MES'];
  }

  return ['OBJETIVO', 'CATEGORIA', 'tipoRepasse', 'DATA_INICIO', 'DATA_FIM', 'MES', 'FISCAL_SUPLENTE'];
}

function camposDetalhadosNumeroPorLista(lista: ListaLegada): readonly (keyof EntidadeSelecionada)[] {
  if (lista === 'fomento2026') {
    return ['VOTOS', 'CONTROLE_ORCAMENTO', 'CONTROLE_PROJETO'];
  }

  return ['VOTOS', 'CONTROLE_ORCAMENTO', 'CONTROLE_PROJETO'];
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
      severidade: 'critica',
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
        severidade: 'critica',
        lista,
        chave,
        campo: 'CNPJ',
        legado: itemLegado.CNPJ,
        dadosVivos: 'ausente',
      });
      continue;
    }

    compararCampos({
      divergencias,
      severidade: 'critica',
      lista,
      chave,
      legado: itemLegado,
      dadosVivos: itemDadosVivos,
      campos: ['ENTIDADE', 'ESTADO', 'SEI', 'FISCAL'],
      tipo: 'texto',
    });

    compararCampos({
      divergencias,
      severidade: 'critica',
      lista,
      chave,
      legado: itemLegado,
      dadosVivos: itemDadosVivos,
      campos: ['NOTA', 'VALOR_REPASSE', 'VALOR_PROJETO'],
      tipo: 'numero',
    });

    compararCampos({
      divergencias,
      severidade: 'critica',
      lista,
      chave,
      legado: itemLegado,
      dadosVivos: itemDadosVivos,
      campos: ['IsCDEN', 'IsPrecursora'],
      tipo: 'booleano',
    });

    compararCampos({
      divergencias,
      severidade: 'observacional',
      lista,
      chave,
      legado: itemLegado,
      dadosVivos: itemDadosVivos,
      campos: camposDetalhadosTextoPorLista(lista),
      tipo: 'texto',
    });

    compararCampos({
      divergencias,
      severidade: 'observacional',
      lista,
      chave,
      legado: itemLegado,
      dadosVivos: itemDadosVivos,
      campos: camposDetalhadosNumeroPorLista(lista),
      tipo: 'numero',
    });
  }

  for (const [chave, itemDadosVivos] of dadosVivosPorChave) {
    if (!legadoPorChave.has(chave)) {
      divergencias.push({
        severidade: 'critica',
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

function contarPor<T>(itens: T[], criarChave: (item: T) => string): Map<string, number> {
  const contagem = new Map<string, number>();

  for (const item of itens) {
    const chave = criarChave(item);
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }

  return contagem;
}

function imprimirResumoObservacional(observacoes: DivergenciaAdapter[]): void {
  if (observacoes.length === 0) {
    console.log('Divergencias observacionais: 0');
    return;
  }

  console.log(`Divergencias observacionais: ${observacoes.length}`);

  const porListaCampo = contarPor(observacoes, (observacao) => `${observacao.lista}.${observacao.campo}`);
  for (const [chave, total] of [...porListaCampo.entries()].sort()) {
    console.log(`- ${chave}: ${total}`);
  }

  console.log('Amostra observacional:');
  for (const observacao of observacoes.slice(0, 10)) {
    console.log(
      `- ${observacao.lista} ${observacao.chave} ${observacao.campo}: legado=${JSON.stringify(observacao.legado)} dadosVivos=${JSON.stringify(observacao.dadosVivos)}`,
    );
  }
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
  const criticas = divergencias.filter((divergencia) => divergencia.severidade === 'critica');
  const observacionais = divergencias.filter((divergencia) => divergencia.severidade === 'observacional');

  if (criticas.length > 0) {
    console.error(`Adapter de dados vivos com ${criticas.length} divergencia(s) critica(s).`);

    for (const divergencia of criticas.slice(0, 20)) {
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
  console.log('Divergencias criticas: 0');
  imprimirResumoObservacional(observacionais);
}

main();
