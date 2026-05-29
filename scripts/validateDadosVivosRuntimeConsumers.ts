import { readFile } from 'fs/promises';
import path from 'path';
import { appDataSchema } from '../src/data/schema';
import { parseData } from '../src/data/parser';
import type { EntidadeSelecionada } from '../src/types';

type AppData = Awaited<ReturnType<typeof parseData>>;

interface ResumoDiretorio {
  total: number;
  estados: number;
  regioes: number;
  categorias: number;
  fiscais: number;
  maiorNota: number;
  menorNota: number;
}

interface ResumoFinanceiro {
  totalProjeto: number;
  totalConcedido: number;
  economia: number;
  regioes: number;
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

function assertCondicao(condicao: unknown, codigo: string): asserts condicao {
  if (!condicao) {
    throw new Error(codigo);
  }
}

function valoresProximos(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01;
}

function valoresUnicos(lista: EntidadeSelecionada[], campo: keyof EntidadeSelecionada): string[] {
  return Array.from(new Set(lista.map((item) => String(item[campo] ?? '').trim()).filter(Boolean))).sort();
}

function getRegiao(item: EntidadeSelecionada): string {
  const camposCompatibilidade = item as unknown as Record<string, unknown>;
  return String(item.REGIÃO ?? camposCompatibilidade['REGIÃƒO'] ?? '').trim();
}

function validarCamposBase(nomeLista: string, lista: EntidadeSelecionada[]): void {
  assertCondicao(lista.length > 0, `${nomeLista}: lista vazia`);

  lista.forEach((item, index) => {
    assertCondicao(item.ENTIDADE.trim(), `${nomeLista}[${index}]: ENTIDADE ausente`);
    assertCondicao(item.CNPJ.trim(), `${nomeLista}[${index}]: CNPJ ausente`);
    assertCondicao(item.ESTADO.trim(), `${nomeLista}[${index}]: ESTADO ausente`);
    assertCondicao(getRegiao(item), `${nomeLista}[${index}]: REGIAO ausente`);
    assertCondicao(Number.isFinite(item.NOTA), `${nomeLista}[${index}]: NOTA invalida`);
    assertCondicao(Number.isFinite(item.VALOR_REPASSE), `${nomeLista}[${index}]: VALOR_REPASSE invalido`);
  });
}

function validarDiretorio(nomeLista: string, lista: EntidadeSelecionada[]): ResumoDiretorio {
  validarCamposBase(nomeLista, lista);

  const estados = valoresUnicos(lista, 'ESTADO');
  const regioes = Array.from(new Set(lista.map(getRegiao).filter(Boolean))).sort();
  const categorias = valoresUnicos(lista, 'CATEGORIA');
  const fiscais = valoresUnicos(lista, 'FISCAL');
  const ordenadoPorNota = [...lista].sort((a, b) => b.NOTA - a.NOTA);
  const primeiroEstado = estados[0];
  const filtradoPorEstado = lista.filter((item) => item.ESTADO === primeiroEstado);
  const primeiroCnpj = lista[0]?.CNPJ ?? '';
  const filtradoPorCnpj = lista.filter((item) => item.CNPJ.includes(primeiroCnpj));

  assertCondicao(estados.length > 0, `${nomeLista}: filtro de estado sem opcoes`);
  assertCondicao(regioes.length > 0, `${nomeLista}: filtro de regiao sem opcoes`);
  assertCondicao(categorias.length > 0, `${nomeLista}: filtro de categoria sem opcoes`);
  assertCondicao(filtradoPorEstado.length > 0, `${nomeLista}: filtro por estado nao retornou itens`);
  assertCondicao(filtradoPorCnpj.length > 0, `${nomeLista}: busca por CNPJ nao retornou itens`);
  assertCondicao(ordenadoPorNota[0].NOTA >= ordenadoPorNota[ordenadoPorNota.length - 1].NOTA, `${nomeLista}: ordenacao por nota invalida`);

  return {
    total: lista.length,
    estados: estados.length,
    regioes: regioes.length,
    categorias: categorias.length,
    fiscais: fiscais.length,
    maiorNota: ordenadoPorNota[0].NOTA,
    menorNota: ordenadoPorNota[ordenadoPorNota.length - 1].NOTA,
  };
}

function validarFinanceiro(nomeLista: string, lista: EntidadeSelecionada[]): ResumoFinanceiro {
  const totalProjeto = lista.reduce((total, item) => total + (item.VALOR_PROJETO ?? 0), 0);
  const totalConcedido = lista.reduce((total, item) => total + (item.VALOR_REPASSE ?? 0), 0);
  const porRegiao = new Map<string, { projeto: number; concedido: number }>();

  lista.forEach((item) => {
    const regiao = getRegiao(item) || 'Indefinida';
    const atual = porRegiao.get(regiao) ?? { projeto: 0, concedido: 0 };
    atual.projeto += item.VALOR_PROJETO ?? 0;
    atual.concedido += item.VALOR_REPASSE ?? 0;
    porRegiao.set(regiao, atual);
  });

  const somaProjetoRegioes = Array.from(porRegiao.values()).reduce((total, item) => total + item.projeto, 0);
  const somaConcedidoRegioes = Array.from(porRegiao.values()).reduce((total, item) => total + item.concedido, 0);

  assertCondicao(totalConcedido > 0, `${nomeLista}: total concedido zerado`);
  assertCondicao(porRegiao.size > 0, `${nomeLista}: consolidacao financeira por regiao vazia`);
  assertCondicao(valoresProximos(somaProjetoRegioes, totalProjeto), `${nomeLista}: soma regional de projeto difere do total`);
  assertCondicao(valoresProximos(somaConcedidoRegioes, totalConcedido), `${nomeLista}: soma regional concedida difere do total`);

  return {
    totalProjeto,
    totalConcedido,
    economia: totalProjeto - totalConcedido,
    regioes: porRegiao.size,
  };
}

function validarCamposEnriquecidos(appData: AppData): void {
  const fomento2026 = appData.fomento2026;
  const comObjetivoLongo = fomento2026.filter((item) => (item.OBJETIVO_COMPLETO ?? '').trim().length > 120);
  const comMultiplasDimensoes = fomento2026.filter((item) => {
    const dimensoes = [item.DIMENSAO_1, item.DIMENSAO_2, item.DIMENSAO_3, item.DIMENSAO_4, item.DIMENSAO_5];
    return dimensoes.filter((valor) => (valor ?? '').trim()).length >= 2;
  });

  assertCondicao(comObjetivoLongo.length > 0, 'fomento2026: nenhum OBJETIVO_COMPLETO longo disponivel para validar expansao');
  assertCondicao(comMultiplasDimensoes.length > 0, 'fomento2026: nenhuma entidade com multiplas DIMENSOES para validar enriquecimento');
}

function imprimirResumo(nomeLista: string, diretorio: ResumoDiretorio, financeiro: ResumoFinanceiro): void {
  console.log(
    [
      `${nomeLista}:`,
      `total=${diretorio.total}`,
      `estados=${diretorio.estados}`,
      `regioes=${diretorio.regioes}`,
      `categorias=${diretorio.categorias}`,
      `fiscais=${diretorio.fiscais}`,
      `nota=${diretorio.menorNota.toFixed(2)}-${diretorio.maiorNota.toFixed(2)}`,
      `repasse=${financeiro.totalConcedido.toFixed(2)}`,
      `projeto=${financeiro.totalProjeto.toFixed(2)}`,
      `regioesFinanceiras=${financeiro.regioes}`,
    ].join(' '),
  );
}

async function main(): Promise<void> {
  const appData = await comFetchLocal(() => parseData({ fonteProjetos: 'dados-vivos' }));
  appDataSchema.parse(appData);

  const listas: Array<[string, EntidadeSelecionada[]]> = [
    ['fomento2026', appData.fomento2026],
    ['fomentoHistorico', appData.fomentoHistorico],
    ['patrocinioHistorico', appData.patrocinioHistorico],
  ];

  for (const [nomeLista, lista] of listas) {
    const diretorio = validarDiretorio(nomeLista, lista);
    const financeiro = validarFinanceiro(nomeLista, lista);
    imprimirResumo(nomeLista, diretorio, financeiro);
  }

  validarCamposEnriquecidos(appData);

  console.log('Consumidores de runtime com dados vivos validados com sucesso.');
}

main();
