import { mediasBRData } from '../../infra_br_medias_brasil';
import { indicadoresData } from '../../infra_br_indicadores';
import { detalhamentoData } from '../../infra_br_detalhamento_indicadores';
import type {
  InfraComponente,
  InfraDetalhamento,
  InfraDimensao,
  InfraIndicador,
  InfraMediaBR,
  InfraState,
} from '../../../types/infra';
import type { ModeloCanonicoInfraBR } from './infra_br';
import type { InfraComponenteCanonico, InfraDimensaoCanonica, InfraIndicadorCanonico } from '../types';
import { carregarInfraBRCanonico, criarIndicesCanonicosInfraBR } from './infra_br';

export interface InfraBRLegacyView {
  infraEstados: InfraState[];
  mediasBR: InfraMediaBR[];
  dimensoes: InfraDimensao[];
  componentes: InfraComponente[];
  indicadores: InfraIndicador[];
  detalhamento: InfraDetalhamento[];
}

function classeParaCor(corClasse?: string): number {
  const color = Number(String(corClasse ?? '').replace('classe_', ''));
  return Number.isFinite(color) ? color : 0;
}

function numeroEstadoId(estadoId?: string): number {
  return Number(estadoId ?? 0) || 0;
}

function dimensaoObrigatoria(
  dimensoesPorId: Map<string, InfraDimensaoCanonica>,
  dimensaoId: string,
): InfraDimensaoCanonica {
  const dimensao = dimensoesPorId.get(dimensaoId);

  if (!dimensao) {
    throw new Error(`Dimensao canonica nao encontrada: ${dimensaoId}`);
  }

  return dimensao;
}

function componenteObrigatorio(
  componentesPorId: Map<string, InfraComponenteCanonico>,
  componenteId: string,
): InfraComponenteCanonico {
  const componente = componentesPorId.get(componenteId);

  if (!componente) {
    throw new Error(`Componente canonico nao encontrado: ${componenteId}`);
  }

  return componente;
}

function indicadorObrigatorio(
  indicadoresPorId: Map<string, InfraIndicadorCanonico>,
  indicadorId: string,
): InfraIndicadorCanonico {
  const indicador = indicadoresPorId.get(indicadorId);

  if (!indicador) {
    throw new Error(`Indicador canonico nao encontrado: ${indicadorId}`);
  }

  return indicador;
}

const nomesLegadosIndicadoresPorId = new Map(
  indicadoresData.map((indicador) => [indicador.indicator_id, indicador.indicator_name]),
);

export function criarInfraBRLegacyView(modelo: ModeloCanonicoInfraBR): InfraBRLegacyView {
  const indices = criarIndicesCanonicosInfraBR(modelo);

  const infraEstados = modelo.infra_estados.map((estado) => ({
    sigla_uf: estado.uf,
    infra_br: estado.infra_br,
    state_id: numeroEstadoId(estado.estado_id),
    rank: estado.ranking ?? 0,
    color: classeParaCor(estado.cor_classe),
  }));

  const dimensoes = modelo.infra_valores_dimensoes.map((valorDimensao) => {
    const dimensao = dimensaoObrigatoria(indices.dimensoes_por_id, valorDimensao.dimensao_id);

    return {
      value: valorDimensao.valor,
      rank: valorDimensao.ranking ?? 0,
      color: classeParaCor(valorDimensao.cor_classe),
      sigla_uf: valorDimensao.uf,
      state_id: numeroEstadoId(valorDimensao.estado_id),
      dimension_id: valorDimensao.dimensao_id,
      dimension_name: dimensao.nome_dimensao,
    };
  });

  const componentes = modelo.infra_valores_componentes.map((valorComponente) => {
    const componente = componenteObrigatorio(indices.componentes_por_id, valorComponente.componente_id);
    const dimensao = dimensaoObrigatoria(indices.dimensoes_por_id, valorComponente.dimensao_id);

    return {
      value: valorComponente.valor,
      rank: valorComponente.ranking ?? 0,
      color: classeParaCor(valorComponente.cor_classe),
      sigla_uf: valorComponente.uf,
      state_id: numeroEstadoId(valorComponente.estado_id),
      component_id: valorComponente.componente_id,
      component_name: componente.nome_componente,
      dimension_id: valorComponente.dimensao_id,
      dimension_name: dimensao.nome_dimensao,
    };
  });

  const indicadores = modelo.infra_detalhes_indicadores.map((detalheIndicador) => {
    const indicador = indicadorObrigatorio(indices.indicadores_por_id, detalheIndicador.indicador_id);
    const componente = componenteObrigatorio(indices.componentes_por_id, indicador.componente_id);
    const dimensao = dimensaoObrigatoria(indices.dimensoes_por_id, componente.dimensao_id);
    const estado = indices.estados_por_uf.get(detalheIndicador.uf);

    return {
      value: detalheIndicador.valor,
      rank: detalheIndicador.ranking ?? 0,
      color: classeParaCor(detalheIndicador.cor_classe),
      sigla_uf: detalheIndicador.uf,
      state_id: numeroEstadoId(estado?.estado_id),
      indicator_id: detalheIndicador.indicador_id,
      component_id: indicador.componente_id,
      component_name: componente.nome_componente,
      dimension_id: componente.dimensao_id,
      dimension_name: dimensao.nome_dimensao,
      indicator_name: nomesLegadosIndicadoresPorId.get(detalheIndicador.indicador_id) ?? indicador.nome_indicador,
      ano: indicador.ano ?? 0,
      descricao: indicador.descricao ?? '',
      fonte: indicador.fonte ?? '',
    };
  });

  return {
    infraEstados,
    mediasBR: mediasBRData as InfraMediaBR[],
    dimensoes,
    componentes,
    indicadores,
    detalhamento: detalhamentoData as InfraDetalhamento[],
  };
}

export function carregarInfraBRLegacyViewCanonica(): InfraBRLegacyView {
  return criarInfraBRLegacyView(carregarInfraBRCanonico());
}
