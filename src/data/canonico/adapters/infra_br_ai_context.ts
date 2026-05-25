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

type SelecaoContextoInfraBR = {
  nivel: NivelRecorteInfraBR;
  dimensoesIds: Set<string>;
  componentesIds: Set<string>;
  indicadoresIds: Set<string>;
};

export interface ContextoIAInfraBR {
  origem: 'canonica';
  divergencias: string[];
  nivel_recorte: NivelRecorteInfraBR;
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

function detectarUFs(pergunta: string, estados: InfraRuntimeData['infraEstados']): string[] {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const ufsDisponiveis = new Set(estados.map((estado) => estado.sigla_uf));

  return Object.entries(UF_ALIASES)
    .filter(([uf, aliases]) => {
      if (!ufsDisponiveis.has(uf)) return false;
      const siglaEncontrada = contemTermo(perguntaNormalizada, uf.toLowerCase());
      const nomeEncontrado = uf === 'PA'
        ? /\bpará\b/i.test(pergunta)
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

function montarSelecaoContextoInfraBR(
  infraData: InfraRuntimeData,
  pergunta: string,
): SelecaoContextoInfraBR {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const mencionaDimensao = contemTermo(perguntaNormalizada, 'dimensao') || contemTermo(perguntaNormalizada, 'dimensoes');
  const mencionaComponente = contemTermo(perguntaNormalizada, 'componente') || contemTermo(perguntaNormalizada, 'componentes');
  const mencionaIndicador = contemTermo(perguntaNormalizada, 'indicador') || contemTermo(perguntaNormalizada, 'indicadores');
  const dimensoesIds = selecionarIdsRelevantes(
    infraData.dimensoes,
    pergunta,
    6,
    (item) => item.dimension_id,
    (item) => item.dimension_name,
  );
  const componentesIdsSemDimensao = selecionarIdsRelevantes(
    infraData.componentes,
    pergunta,
    8,
    (item) => item.component_id,
    (item) => item.component_name,
  );
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
    return { nivel: 'indicador', dimensoesIds, componentesIds, indicadoresIds };
  }

  if (componentesIds.size > 0) {
    return { nivel: 'componente', dimensoesIds, componentesIds, indicadoresIds };
  }

  if (dimensoesIds.size > 0) {
    return { nivel: 'dimensao', dimensoesIds, componentesIds, indicadoresIds };
  }

  return { nivel: 'geral', dimensoesIds, componentesIds, indicadoresIds };
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
    .filter((item) => selecao.nivel === 'dimensao' && selecao.dimensoesIds.has(item.dimension_id))
    .map((item) => ({
      id: item.dimension_id,
      nome: item.dimension_name,
      nota: item.value,
      rank: item.rank,
    }));

  const componentes = infraData.componentes
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => selecao.nivel === 'componente' && selecao.componentesIds.has(item.component_id))
    .map((item) => ({
      id: item.component_id,
      nome: item.component_name,
      nota: item.value,
      rank: item.rank,
      dimensao: item.dimension_name,
    }));

  const indicadores = infraData.indicadores
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => selecao.nivel === 'indicador' && selecao.indicadoresIds.has(item.indicator_id))
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
  const ufsParaRecorte = ufsDetectadas.length > 0
    ? ufsDetectadas
    : infraData.infraEstados
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((estado) => estado.sigla_uf);

  const recortes = ufsParaRecorte
    .map((uf) => montarRecorteUF(infraData, uf, selecao))
    .filter((item): item is ContextoIAInfraBRUF => Boolean(item));

  return {
    origem,
    divergencias,
    nivel_recorte: selecao.nivel,
    cobertura: {
      estados: infraData.infraEstados.length,
      dimensoes: dimensoesNomes.length,
      componentes: componentesNomes.length,
      indicadores: indicadoresNomes.length,
    },
    estados_resumo: infraData.infraEstados
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((estado) => ({
        uf: estado.sigla_uf,
        nota_geral: estado.infra_br,
        rank_geral: estado.rank,
      })),
    catalogo: {
      dimensoes: dimensoesNomes,
      componentes: componentesNomes.map((nome) => {
        const exemplo = infraData.componentes.find((item) => item.component_name === nome);
        return {
          id: exemplo?.component_id,
          nome,
          dimensao: exemplo?.dimension_name,
        };
      }),
      indicadores: indicadoresNomes.map((nome) => {
        const exemplo = infraData.indicadores.find((item) => item.indicator_name === nome);
        return {
          id: exemplo?.indicator_id,
          nome,
          dimensao: exemplo?.dimension_name,
          componente: exemplo?.component_name,
          descricao: exemplo?.descricao,
          fonte: exemplo?.fonte,
        };
      }),
    },
    recortes_por_uf: recortes,
    observacoes: [
      'Responda somente no nivel solicitado em nivel_recorte; nao amplie dimensao para componentes nem componente para indicadores sem pedido explicito.',
      'Quando houver UF na pergunta, priorize o recorte da respectiva UF.',
      'Nao confunda termos parecidos: por exemplo, PORTOS e AEROPORTOS sao componentes diferentes.',
    ],
  };
}
