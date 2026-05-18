import type { InfraRuntimeData } from '../../runtime-loaders';
import type { OrigemConsumoInfraBR } from './infra_br_consumo';

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

export interface ContextoIAInfraBR {
  origem: OrigemConsumoInfraBR;
  divergencias: string[];
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
      const nomeEncontrado = aliases.some((alias) => contemTermo(perguntaNormalizada, alias));
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

function selecionarNomesRelevantes(nomes: string[], pergunta: string, limite: number): Set<string> {
  const perguntaNormalizada = normalizarTexto(pergunta);
  const tokens = extrairTokens(pergunta);
  const pontuados = nomes
    .map((nome) => ({ nome, score: pontuarNome(nome, perguntaNormalizada, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.nome.localeCompare(b.nome, 'pt-BR'))
    .slice(0, limite)
    .map((item) => item.nome);

  return new Set(pontuados);
}

function montarRecorteUF(
  infraData: InfraRuntimeData,
  uf: string,
  dimensoesRelevantes: Set<string>,
  componentesRelevantes: Set<string>,
  indicadoresRelevantes: Set<string>,
): ContextoIAInfraBRUF | null {
  const estado = infraData.infraEstados.find((item) => item.sigla_uf === uf);
  if (!estado) return null;

  const deveFiltrar = dimensoesRelevantes.size > 0 || componentesRelevantes.size > 0 || indicadoresRelevantes.size > 0;
  const dimensoes = infraData.dimensoes
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => !deveFiltrar || dimensoesRelevantes.has(item.dimension_name))
    .map((item) => ({
      id: item.dimension_id,
      nome: item.dimension_name,
      nota: item.value,
      rank: item.rank,
    }));

  const componentes = infraData.componentes
    .filter((item) => item.sigla_uf === uf)
    .filter((item) => {
      if (!deveFiltrar) return true;
      if (componentesRelevantes.size > 0) return componentesRelevantes.has(item.component_name);
      if (indicadoresRelevantes.size > 0) {
        return infraData.indicadores.some((indicador) => (
          indicador.component_name === item.component_name &&
          indicadoresRelevantes.has(indicador.indicator_name)
        ));
      }
      return dimensoesRelevantes.has(item.dimension_name);
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
      if (!deveFiltrar) return true;
      if (componentesRelevantes.size > 0) {
        return componentesRelevantes.has(item.component_name) && (
          indicadoresRelevantes.size === 0 || indicadoresRelevantes.has(item.indicator_name)
        );
      }
      if (indicadoresRelevantes.size > 0) return indicadoresRelevantes.has(item.indicator_name);
      return dimensoesRelevantes.has(item.dimension_name);
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
  origem: OrigemConsumoInfraBR;
  divergencias: string[];
}): ContextoIAInfraBR {
  const { pergunta, infraData, origem, divergencias } = params;
  const ufsDetectadas = detectarUFs(pergunta, infraData.infraEstados);
  const dimensoesNomes = nomesUnicos(infraData.dimensoes.map((item) => item.dimension_name));
  const componentesNomes = nomesUnicos(infraData.componentes.map((item) => item.component_name));
  const indicadoresNomes = nomesUnicos(infraData.indicadores.map((item) => item.indicator_name));
  const dimensoesRelevantes = selecionarNomesRelevantes(dimensoesNomes, pergunta, 6);
  const componentesRelevantes = selecionarNomesRelevantes(componentesNomes, pergunta, 8);
  const indicadoresRelevantes = selecionarNomesRelevantes(indicadoresNomes, pergunta, 12);
  const ufsParaRecorte = ufsDetectadas.length > 0
    ? ufsDetectadas
    : infraData.infraEstados
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((estado) => estado.sigla_uf);

  const recortes = ufsParaRecorte
    .map((uf) => montarRecorteUF(infraData, uf, dimensoesRelevantes, componentesRelevantes, indicadoresRelevantes))
    .filter((item): item is ContextoIAInfraBRUF => Boolean(item));

  return {
    origem,
    divergencias,
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
      'Use a cadeia dimensao -> componente -> indicador para responder perguntas sobre notas Infra-BR.',
      'Quando houver UF na pergunta, priorize o recorte da respectiva UF.',
      'Nao confunda termos parecidos: por exemplo, PORTOS e AEROPORTOS sao componentes diferentes.',
    ],
  };
}
