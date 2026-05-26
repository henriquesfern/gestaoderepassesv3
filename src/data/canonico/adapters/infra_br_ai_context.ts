import type { InfraRuntimeData } from '../../runtime-loaders';

type ContextoIAInfraBRItem = {
  id?: string;
  nome: string;
  nota?: number;
  rank?: number;
  dimensao?: string;
  componente?: string;
  indicador?: string;
  descricao?: string;
  fonte?: string;
};

type ContextoIAInfraBRUF = {
  uf: string;
  nota_geral: number;
  rank_geral: number;
  dimensoes: ContextoIAInfraBRItem[];
  componentes: ContextoIAInfraBRItem[];
  indicadores: ContextoIAInfraBRItem[];
};

type NivelRecorteInfraBR = 'geral' | 'dimensao' | 'componente' | 'indicador';
type ModoRespostaInfraBR = 'direta' | 'comparativa' | 'catalogo' | 'composicao' | 'diagnostico';

type SelecaoContextoInfraBR = {
  nivel: NivelRecorteInfraBR;
  modo: ModoRespostaInfraBR;
  dimensoesIds: Set<string>;
  componentesIds: Set<string>;
  indicadoresIds: Set<string>;
};

export interface ContextoIAInfraBR {
  origem: 'canonica';
  divergencias: string[];
  nivel_recorte: NivelRecorteInfraBR;
  modo_resposta: ModoRespostaInfraBR;
  cobertura: {
    estados: number;
    dimensoes: number;
    componentes: number;
    indicadores: number;
  };
  estados_resumo: Array<{
    uf: string;
    nota_geral: number;
    rank_geral: number;
  }>;
  catalogo: {
    dimensoes: string[];
    componentes: ContextoIAInfraBRItem[];
    indicadores: ContextoIAInfraBRItem[];
  };
  recortes_por_uf: ContextoIAInfraBRUF[];
  observacoes: string[];
}

const UF_ALIASES: Record<string, string[]> = {
  AC: ['acre'],
  AL: ['alagoas'],
  AP: ['amapa'],
  AM: ['amazonas'],
  BA: ['bahia'],
  CE: ['ceara'],
  DF: ['distrito federal', 'brasilia'],
  ES: ['espirito santo'],
  GO: ['goias'],
  MA: ['maranhao'],
  MT: ['mato grosso'],
  MS: ['mato grosso do sul'],
  MG: ['minas gerais'],
  PA: ['para'],
  PB: ['paraiba'],
  PR: ['parana'],
  PE: ['pernambuco'],
  PI: ['piaui'],
  RJ: ['rio de janeiro'],
  RN: ['rio grande do norte'],
  RS: ['rio grande do sul'],
  RO: ['rondonia'],
  RR: ['roraima'],
  SC: ['santa catarina'],
  SP: ['sao paulo'],
  SE: ['sergipe'],
  TO: ['tocantins'],
};

const STOP_WORDS = new Set([
  'sobre',
  'qual',
  'quais',
  'como',
  'para',
  'pela',
  'pelo',
  'dos',
  'das',
  'uma',
  'nota',
  'notas',
  'rank',
  'ranking',
  'infra',
  'infrabr',
  'infra-br',
  'estado',
  'estados',
  'dimensao',
  'dimensoes',
  'componente',
  'componentes',
  'indicador',
  'indicadores',
]);

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extrairTokens(texto: string): string[] {
  return Array.from(new Set(
    normalizarTexto(texto)
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !STOP_WORDS.has(token)),
  ));
}

function contemTermo(textoNormalizado: string, termoNormalizado: string): boolean {
  if (!termoNormalizado) return false;
  const escaped = termoNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(textoNormalizado);
}

function contemAlgumTermo(textoNormalizado: string, termos: string[]): boolean {
  return termos.some((termo) => contemTermo(textoNormalizado, termo));
}

function contemParaAcentuado(texto: string): boolean {
  return /(^|[^A-Za-z\u00c0-\u017f])par\u00e1([^A-Za-z\u00c0-\u017f]|$)/i.test(texto);
}

function detectarUFs(pergunta: string, estados: InfraRuntimeData['infraEstados']): string[] {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const ufsDisponiveis = new Set(estados.map((estado) => estado.sigla_uf));

  return Object.entries(UF_ALIASES)
    .filter(([uf, aliases]) => {
      if (!ufsDisponiveis.has(uf)) return false;
      const siglaEncontrada = contemTermo(perguntaNormalizada, uf.toLowerCase());
      const nomeEncontrado = uf === 'PA'
        ? contemParaAcentuado(pergunta)
        : aliases.some((alias) => contemTermo(perguntaNormalizada, alias));
      return siglaEncontrada || nomeEncontrado;
    })
    .map(([uf]) => uf);
}

function pontuarNome(nome: string, perguntaNormalizada: string, tokens: string[]): number {
  const nomeNormalizado = normalizarTexto(nome);
  let score = 0;

  if (contemTermo(perguntaNormalizada, nomeNormalizado)) score += 100;

  for (const token of tokens) {
    if (contemTermo(nomeNormalizado, token)) score += 20;
  }

  return score;
}

function nomesUnicos(valores: string[]): string[] {
  return Array.from(new Set(valores.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function selecionarIdsRelevantes<T>(
  itens: T[],
  pergunta: string,
  limite: number,
  obterId: (item: T) => string,
  obterNome: (item: T) => string,
  scoreMinimo = 1,
): Set<string> {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const tokens = extrairTokens(pergunta);
  const pontuadosPorId = new Map<string, { id: string; nome: string; score: number }>();

  for (const item of itens) {
    const id = obterId(item);
    const nome = obterNome(item);
    const score = pontuarNome(nome, perguntaNormalizada, tokens);
    const atual = pontuadosPorId.get(id);

    if (score >= scoreMinimo && (!atual || score > atual.score)) {
      pontuadosPorId.set(id, { id, nome, score });
    }
  }

  return new Set([...pontuadosPorId.values()]
    .sort((a, b) => b.score - a.score || a.nome.localeCompare(b.nome, 'pt-BR'))
    .slice(0, limite)
    .map((item) => item.id));
}

function detectarModoResposta(perguntaNormalizada: string): ModoRespostaInfraBR {
  const perguntaSobreComponentesExistentes = contemTermo(perguntaNormalizada, 'componentes') && contemTermo(perguntaNormalizada, 'existem');
  const perguntaSobreIndicadoresExistentes = contemTermo(perguntaNormalizada, 'indicadores') && contemTermo(perguntaNormalizada, 'existem');
  const perguntaSobreDimensoesExistentes = contemTermo(perguntaNormalizada, 'dimensoes') && contemTermo(perguntaNormalizada, 'existem');
  const perguntaSobreCatalogoDimensoes = contemTermo(perguntaNormalizada, 'dimensoes') && contemAlgumTermo(perguntaNormalizada, [
    'quais',
    'liste',
    'listar',
    'catalogo',
    'disponiveis',
  ]);
  const perguntaSobreCatalogoComponentes = contemTermo(perguntaNormalizada, 'componentes') && contemAlgumTermo(perguntaNormalizada, [
    'quais',
    'liste',
    'listar',
    'disponiveis',
  ]);
  const perguntaSobreCatalogoIndicadores = contemTermo(perguntaNormalizada, 'indicadores') && contemAlgumTermo(perguntaNormalizada, [
    'quais',
    'liste',
    'listar',
    'disponiveis',
  ]);

  if (contemAlgumTermo(perguntaNormalizada, [
    'compare',
    'comparar',
    'comparacao',
    'ranking',
    'rankear',
    'melhores',
    'piores',
    'todos',
    'todas',
  ])) {
    return 'comparativa';
  }

  if (contemAlgumTermo(perguntaNormalizada, [
    'explique',
    'explicar',
    'porque',
    'por que',
    'diagnostico',
    'desempenho',
    'pontos fortes',
    'pontos fracos',
    'fraquezas',
    'detalhe',
    'detalhar',
  ])) {
    return 'diagnostico';
  }

  if (perguntaSobreComponentesExistentes || perguntaSobreIndicadoresExistentes || perguntaSobreCatalogoComponentes || perguntaSobreCatalogoIndicadores || contemAlgumTermo(perguntaNormalizada, [
    'compoe',
    'compoem',
    'composicao',
    'integra',
    'integram',
    'faz parte',
    'fazem parte',
  ])) {
    return 'composicao';
  }

  if (perguntaSobreDimensoesExistentes || perguntaSobreCatalogoDimensoes || contemAlgumTermo(perguntaNormalizada, [
    'quais existem',
    'liste',
    'listar',
    'catalogo',
    'disponiveis',
  ])) {
    return 'catalogo';
  }

  return 'direta';
}

function montarSelecaoContextoInfraBR(
  infraData: InfraRuntimeData,
  pergunta: string,
): SelecaoContextoInfraBR {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const modo = detectarModoResposta(perguntaNormalizada);
  const mencionaDimensao = contemTermo(perguntaNormalizada, 'dimensao') || contemTermo(perguntaNormalizada, 'dimensoes');
  const mencionaComponente = contemTermo(perguntaNormalizada, 'componente') || contemTermo(perguntaNormalizada, 'componentes');
  const mencionaIndicador = contemTermo(perguntaNormalizada, 'indicador') || contemTermo(perguntaNormalizada, 'indicadores');
  const perguntaPedeExtremo = contemAlgumTermo(perguntaNormalizada, [
    'maior',
    'menor',
    'melhor',
    'pior',
    'alta',
    'baixa',
    'maiores',
    'menores',
    'melhores',
    'piores',
  ]);
  const dimensoesIdsSelecionadas = selecionarIdsRelevantes(
    infraData.dimensoes,
    pergunta,
    6,
    (item) => item.dimension_id,
    (item) => item.dimension_name,
  );
  const dimensoesIds = mencionaDimensao && (dimensoesIdsSelecionadas.size === 0 || perguntaPedeExtremo)
    ? new Set(infraData.dimensoes.map((item) => item.dimension_id))
    : dimensoesIdsSelecionadas;
  const componentesIdsSemDimensaoSelecionados = selecionarIdsRelevantes(
    infraData.componentes,
    pergunta,
    8,
    (item) => item.component_id,
    (item) => item.component_name,
  );
  const componentesIdsSemDimensao = mencionaComponente && componentesIdsSemDimensaoSelecionados.size === 0
    ? new Set(infraData.componentes.map((item) => item.component_id))
    : componentesIdsSemDimensaoSelecionados;
  const indicadoresIdsSemEscopo = selecionarIdsRelevantes(
    infraData.indicadores,
    pergunta,
    12,
    (item) => item.indicator_id,
    (item) => item.indicator_name,
    100,
  );
  const componentesIds = new Set([...componentesIdsSemDimensao].filter((componenteId) => {
    if (dimensoesIds.size === 0) return true;
    return infraData.componentes.some((item) => (
      item.component_id === componenteId &&
      dimensoesIds.has(item.dimension_id)
    ));
  }));
  const indicadoresIds = new Set([...indicadoresIdsSemEscopo].filter((indicadorId) => {
    if (componentesIds.size > 0) {
      return infraData.indicadores.some((item) => (
        item.indicator_id === indicadorId &&
        componentesIds.has(item.component_id)
      ));
    }

    if (dimensoesIds.size > 0) {
      return infraData.indicadores.some((item) => (
        item.indicator_id === indicadorId &&
        dimensoesIds.has(item.dimension_id)
      ));
    }

    return true;
  }));

  if (indicadoresIds.size > 0 && (mencionaIndicador || (componentesIds.size === 0 && dimensoesIds.size === 0))) {
    return { nivel: 'indicador', modo, dimensoesIds, componentesIds, indicadoresIds };
  }

  if (componentesIds.size > 0) {
    return { nivel: 'componente', modo, dimensoesIds, componentesIds, indicadoresIds };
  }

  if (dimensoesIds.size > 0) {
    return { nivel: 'dimensao', modo, dimensoesIds, componentesIds, indicadoresIds };
  }

  return { nivel: 'geral', modo, dimensoesIds, componentesIds, indicadoresIds };
}

function itensUnicosPorId<T>(itens: T[], obterId: (item: T) => string): T[] {
  const vistos = new Set<string>();
  const unicos: T[] = [];

  for (const item of itens) {
    const id = obterId(item);

    if (!vistos.has(id)) {
      vistos.add(id);
      unicos.push(item);
    }
  }

  return unicos;
}

function montarRecorteUF(
  infraData: InfraRuntimeData,
  uf: string,
  selecao: SelecaoContextoInfraBR,
): ContextoIAInfraBRUF | null {
  const estado = infraData.infraEstados.find((item) => item.sigla_uf === uf);
  if (!estado) return null;

  const dimensoes = infraData.dimensoes
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => (
      selecao.nivel === 'dimensao' &&
      selecao.dimensoesIds.has(item.dimension_id) &&
      selecao.modo !== 'catalogo'
    ))
    .sort((a, b) => b.value - a.value || a.dimension_name.localeCompare(b.dimension_name, 'pt-BR'))
    .map((item) => ({
      id: item.dimension_id,
      nome: item.dimension_name,
      nota: item.value,
      rank: item.rank,
    }));

  const componentes = infraData.componentes
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => {
      if (selecao.modo === 'catalogo') return false;
      if (selecao.nivel === 'componente') return selecao.componentesIds.has(item.component_id);
      if (selecao.nivel === 'dimensao') {
        return ['composicao', 'diagnostico'].includes(selecao.modo) && selecao.dimensoesIds.has(item.dimension_id);
      }
      return false;
    })
    .map((item) => ({
      id: item.component_id,
      nome: item.component_name,
      nota: item.value,
      rank: item.rank,
      dimensao: item.dimension_name,
    }));

  const indicadores = infraData.indicadores
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => {
      if (selecao.modo === 'catalogo') return false;
      if (selecao.nivel === 'indicador') return selecao.indicadoresIds.has(item.indicator_id);
      if (selecao.nivel === 'componente') {
        return ['composicao', 'diagnostico'].includes(selecao.modo) && selecao.componentesIds.has(item.component_id);
      }
      return false;
    })
    .map((item) => ({
      id: item.indicator_id,
      nome: item.indicator_name,
      nota: item.value,
      rank: item.rank,
      dimensao: item.dimension_name,
      componente: item.component_name,
      descricao: item.descricao,
      fonte: item.fonte,
    }));

  return {
    uf,
    nota_geral: estado.infra_br,
    rank_geral: estado.rank,
    dimensoes: dimensoes.slice(0, 6),
    componentes: componentes.slice(0, 20),
    indicadores: indicadores.slice(0, 80),
  };
}

export function construirContextoIAInfraBR(params: {
  pergunta: string;
  infraData: InfraRuntimeData;
  origem: 'canonica';
  divergencias: string[];
}): ContextoIAInfraBR {
  const { pergunta, infraData, origem, divergencias } = params;
  const ufsDetectadas = detectarUFs(pergunta, infraData.infraEstados);
  const dimensoesNomes = nomesUnicos(infraData.dimensoes.map((item) => item.dimension_name));
  const componentesNomes = nomesUnicos(infraData.componentes.map((item) => item.component_name));
  const indicadoresNomes = nomesUnicos(infraData.indicadores.map((item) => item.indicator_name));
  const selecao = montarSelecaoContextoInfraBR(infraData, pergunta);
  const usarTodosEstados = selecao.modo === 'comparativa' && ufsDetectadas.length === 0;
  const usarCatalogoEstrutural = selecao.modo === 'catalogo' || (selecao.modo === 'composicao' && ufsDetectadas.length === 0);
  const usarRecortes = !usarCatalogoEstrutural;
  const ufsParaRecorte = ufsDetectadas.length > 0
    ? ufsDetectadas
    : usarTodosEstados
      ? infraData.infraEstados
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((estado) => estado.sigla_uf)
      : infraData.infraEstados
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((estado) => estado.sigla_uf);

  const recortes = usarRecortes
    ? ufsParaRecorte
      .map((uf) => montarRecorteUF(infraData, uf, selecao))
      .filter((item): item is ContextoIAInfraBRUF => Boolean(item))
    : [];
  const incluirEstadosResumo = selecao.modo === 'comparativa' && selecao.nivel === 'geral';
  const catalogoDimensoes = usarCatalogoEstrutural
    ? dimensoesNomes.filter((nome) => {
      if (selecao.nivel === 'geral') return true;
      if (selecao.nivel === 'dimensao') {
        return infraData.dimensoes.some((item) => item.dimension_name === nome && selecao.dimensoesIds.has(item.dimension_id));
      }
      if (selecao.nivel === 'componente') {
        return infraData.componentes.some((item) => item.dimension_name === nome && selecao.componentesIds.has(item.component_id));
      }
      return infraData.indicadores.some((item) => item.dimension_name === nome && selecao.indicadoresIds.has(item.indicator_id));
    })
    : [];
  const catalogoComponentes = usarCatalogoEstrutural
    ? itensUnicosPorId(
      infraData.componentes.filter((item) => {
        if (selecao.nivel === 'dimensao') return selecao.modo !== 'catalogo' && selecao.dimensoesIds.has(item.dimension_id);
        if (selecao.nivel === 'componente') return selecao.componentesIds.has(item.component_id);
        return selecao.modo === 'catalogo' && selecao.componentesIds.has(item.component_id);
      }),
      (item) => item.component_id,
    ).map((item) => ({
      id: item.component_id,
      nome: item.component_name,
      dimensao: item.dimension_name,
    }))
    : [];
  const catalogoIndicadores = usarCatalogoEstrutural
    ? itensUnicosPorId(
      infraData.indicadores.filter((item) => {
        if (selecao.nivel === 'componente') return selecao.componentesIds.has(item.component_id);
        if (selecao.nivel === 'indicador') return selecao.indicadoresIds.has(item.indicator_id);
        return false;
      }),
      (item) => item.indicator_id,
    ).map((item) => ({
      id: item.indicator_id,
      nome: item.indicator_name,
      dimensao: item.dimension_name,
      componente: item.component_name,
      descricao: item.descricao,
      fonte: item.fonte,
    }))
    : [];

  return {
    origem,
    divergencias,
    nivel_recorte: selecao.nivel,
    modo_resposta: selecao.modo,
    cobertura: {
      estados: infraData.infraEstados.length,
      dimensoes: dimensoesNomes.length,
      componentes: componentesNomes.length,
      indicadores: indicadoresNomes.length,
    },
    estados_resumo: incluirEstadosResumo
      ? infraData.infraEstados
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((estado) => ({
          uf: estado.sigla_uf,
          nota_geral: estado.infra_br,
          rank_geral: estado.rank,
        }))
      : [],
    catalogo: {
      dimensoes: catalogoDimensoes,
      componentes: catalogoComponentes,
      indicadores: catalogoIndicadores,
    },
    recortes_por_uf: recortes,
    observacoes: [
      'Responda somente no nivel solicitado em nivel_recorte e no modo indicado em modo_resposta.',
      'Quando houver UF na pergunta, priorize o recorte da respectiva UF.',
      'Nao confunda termos parecidos: por exemplo, PORTOS e AEROPORTOS sao componentes diferentes.',
    ],
  };
}
