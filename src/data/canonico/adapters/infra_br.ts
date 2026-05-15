import { componentesData } from '../../infra_br_componentes';
import { detalhamentoData } from '../../infra_br_detalhamento_indicadores';
import { dimensoesData } from '../../infra_br_dimensoes';
import { infraBRData } from '../../infra_br_estados';
import { indicadoresData } from '../../infra_br_indicadores';
import {
  normalizarInfraDetalhesIndicadores,
  normalizarInfraEstados,
  normalizarInfraEstrutura,
  normalizarInfraIndicadores,
  normalizarInfraValoresComponentes,
  normalizarInfraValoresDimensoes,
} from '../normalizers';
import type {
  InfraComponenteCanonico,
  InfraDetalheIndicadorCanonico,
  InfraDimensaoCanonica,
  InfraEstadoCanonico,
  InfraIndicadorCanonico,
  InfraValorComponenteCanonico,
  InfraValorDimensaoCanonico,
  UnidadeFederativa,
} from '../types';

export interface ModeloCanonicoInfraBR {
  infra_estados: InfraEstadoCanonico[];
  infra_dimensoes: InfraDimensaoCanonica[];
  infra_valores_dimensoes: InfraValorDimensaoCanonico[];
  infra_componentes: InfraComponenteCanonico[];
  infra_valores_componentes: InfraValorComponenteCanonico[];
  infra_indicadores: InfraIndicadorCanonico[];
  infra_detalhes_indicadores: InfraDetalheIndicadorCanonico[];
}

export interface IndicesCanonicosInfraBR {
  estados_por_uf: Map<UnidadeFederativa, InfraEstadoCanonico>;
  dimensoes_por_id: Map<string, InfraDimensaoCanonica>;
  componentes_por_id: Map<string, InfraComponenteCanonico>;
  indicadores_por_id: Map<string, InfraIndicadorCanonico>;
  valores_dimensoes_por_uf: Map<UnidadeFederativa, InfraValorDimensaoCanonico[]>;
  valores_componentes_por_uf: Map<UnidadeFederativa, InfraValorComponenteCanonico[]>;
  detalhes_indicadores_por_uf: Map<UnidadeFederativa, InfraDetalheIndicadorCanonico[]>;
}

function agruparPorUf<T extends { uf: UnidadeFederativa }>(itens: T[]): Map<UnidadeFederativa, T[]> {
  const grupos = new Map<UnidadeFederativa, T[]>();

  for (const item of itens) {
    const grupo = grupos.get(item.uf) ?? [];
    grupo.push(item);
    grupos.set(item.uf, grupo);
  }

  return grupos;
}

export function construirModeloCanonicoInfraBR(): ModeloCanonicoInfraBR {
  const estados = normalizarInfraEstados(infraBRData);
  const estrutura = normalizarInfraEstrutura(dimensoesData, componentesData);
  const valoresDimensoes = normalizarInfraValoresDimensoes(
    dimensoesData,
    estrutura.infra_dimensoes.map((dimensao) => dimensao.dimensao_id),
    estados.infra_estados.map((estado) => estado.uf),
  );
  const valoresComponentes = normalizarInfraValoresComponentes(
    componentesData,
    estrutura.infra_componentes.map((componente) => componente.componente_id),
    estrutura.infra_dimensoes.map((dimensao) => dimensao.dimensao_id),
    estados.infra_estados.map((estado) => estado.uf),
  );
  const indicadores = normalizarInfraIndicadores(detalhamentoData, indicadoresData);
  const detalhesIndicadores = normalizarInfraDetalhesIndicadores(
    indicadoresData,
    indicadores.infra_indicadores.map((indicador) => indicador.indicador_id),
    estados.infra_estados.map((estado) => estado.uf),
  );

  return {
    infra_estados: estados.infra_estados,
    infra_dimensoes: estrutura.infra_dimensoes,
    infra_valores_dimensoes: valoresDimensoes.infra_valores_dimensoes,
    infra_componentes: estrutura.infra_componentes,
    infra_valores_componentes: valoresComponentes.infra_valores_componentes,
    infra_indicadores: indicadores.infra_indicadores,
    infra_detalhes_indicadores: detalhesIndicadores.infra_detalhes_indicadores,
  };
}

export function criarIndicesCanonicosInfraBR(modelo: ModeloCanonicoInfraBR): IndicesCanonicosInfraBR {
  return {
    estados_por_uf: new Map(modelo.infra_estados.map((estado) => [estado.uf, estado])),
    dimensoes_por_id: new Map(modelo.infra_dimensoes.map((dimensao) => [dimensao.dimensao_id, dimensao])),
    componentes_por_id: new Map(modelo.infra_componentes.map((componente) => [componente.componente_id, componente])),
    indicadores_por_id: new Map(modelo.infra_indicadores.map((indicador) => [indicador.indicador_id, indicador])),
    valores_dimensoes_por_uf: agruparPorUf(modelo.infra_valores_dimensoes),
    valores_componentes_por_uf: agruparPorUf(modelo.infra_valores_componentes),
    detalhes_indicadores_por_uf: agruparPorUf(modelo.infra_detalhes_indicadores),
  };
}

export function carregarInfraBRCanonico(): ModeloCanonicoInfraBR {
  return construirModeloCanonicoInfraBR();
}
