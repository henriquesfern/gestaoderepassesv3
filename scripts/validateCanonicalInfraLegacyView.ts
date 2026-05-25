import { carregarInfraBRLegacyViewCanonica } from '../src/data/canonico/adapters';
import { infraData } from '../src/data/infra_br_parser';

const legacyView = carregarInfraBRLegacyViewCanonica();

function assertEqual<T>(contexto: string, atual: T, esperado: T): void {
  if (atual !== esperado) {
    throw new Error(`${contexto}: esperado ${String(esperado)}, encontrado ${String(atual)}.`);
  }
}

function assertNumero(contexto: string, atual: number, esperado: number): void {
  if (Math.abs(atual - esperado) > 0.000001) {
    throw new Error(`${contexto}: esperado ${esperado}, encontrado ${atual}.`);
  }
}

function indexarPor<T>(itens: T[], criarChave: (item: T) => string): Map<string, T> {
  return new Map(itens.map((item) => [criarChave(item), item]));
}

assertEqual('Total de estados', legacyView.infraEstados.length, infraData.infraEstados.length);
assertEqual('Total de medias BR', legacyView.mediasBR.length, infraData.mediasBR.length);
assertEqual('Total de dimensoes', legacyView.dimensoes.length, infraData.dimensoes.length);
assertEqual('Total de componentes', legacyView.componentes.length, infraData.componentes.length);
assertEqual('Total de indicadores', legacyView.indicadores.length, infraData.indicadores.length);
assertEqual('Total de detalhamento', legacyView.detalhamento.length, infraData.detalhamento.length);

const estadosCanonicos = indexarPor(legacyView.infraEstados, (estado) => estado.sigla_uf);
const dimensoesCanonicas = indexarPor(
  legacyView.dimensoes,
  (dimensao) => `${dimensao.dimension_id}__${dimensao.sigla_uf}`,
);
const componentesCanonicos = indexarPor(
  legacyView.componentes,
  (componente) => `${componente.component_id}__${componente.sigla_uf}`,
);
const indicadoresCanonicos = indexarPor(
  legacyView.indicadores,
  (indicador) => `${indicador.indicator_id}__${indicador.sigla_uf}`,
);
const detalhamentoCanonico = indexarPor(legacyView.detalhamento, (detalhe) => detalhe.ID);

for (const estadoLegado of infraData.infraEstados) {
  const estadoCanonico = estadosCanonicos.get(estadoLegado.sigla_uf);
  const contexto = `Estado ${estadoLegado.sigla_uf}`;

  if (!estadoCanonico) {
    throw new Error(`${contexto}: nao encontrado na legacy view canonica.`);
  }

  assertNumero(`${contexto} infra_br`, estadoCanonico.infra_br, estadoLegado.infra_br);
  assertEqual(`${contexto} state_id`, estadoCanonico.state_id, estadoLegado.state_id);
  assertEqual(`${contexto} rank`, estadoCanonico.rank, estadoLegado.rank);
  assertEqual(`${contexto} color`, estadoCanonico.color, estadoLegado.color);
}

for (const dimensaoLegada of infraData.dimensoes) {
  const chave = `${dimensaoLegada.dimension_id}__${dimensaoLegada.sigla_uf}`;
  const dimensaoCanonica = dimensoesCanonicas.get(chave);
  const contexto = `Dimensao ${chave}`;

  if (!dimensaoCanonica) {
    throw new Error(`${contexto}: nao encontrada na legacy view canonica.`);
  }

  assertNumero(`${contexto} value`, dimensaoCanonica.value, dimensaoLegada.value);
  assertEqual(`${contexto} rank`, dimensaoCanonica.rank, dimensaoLegada.rank);
  assertEqual(`${contexto} color`, dimensaoCanonica.color, dimensaoLegada.color);
  assertEqual(`${contexto} state_id`, dimensaoCanonica.state_id, dimensaoLegada.state_id);
  assertEqual(`${contexto} dimension_name`, dimensaoCanonica.dimension_name, dimensaoLegada.dimension_name);
}

for (const componenteLegado of infraData.componentes) {
  const chave = `${componenteLegado.component_id}__${componenteLegado.sigla_uf}`;
  const componenteCanonico = componentesCanonicos.get(chave);
  const contexto = `Componente ${chave}`;

  if (!componenteCanonico) {
    throw new Error(`${contexto}: nao encontrado na legacy view canonica.`);
  }

  assertNumero(`${contexto} value`, componenteCanonico.value, componenteLegado.value);
  assertEqual(`${contexto} rank`, componenteCanonico.rank, componenteLegado.rank);
  assertEqual(`${contexto} color`, componenteCanonico.color, componenteLegado.color);
  assertEqual(`${contexto} state_id`, componenteCanonico.state_id, componenteLegado.state_id);
  assertEqual(`${contexto} component_name`, componenteCanonico.component_name, componenteLegado.component_name);
  assertEqual(`${contexto} dimension_id`, componenteCanonico.dimension_id, componenteLegado.dimension_id);
  assertEqual(`${contexto} dimension_name`, componenteCanonico.dimension_name, componenteLegado.dimension_name);
}

for (const indicadorLegado of infraData.indicadores) {
  const chave = `${indicadorLegado.indicator_id}__${indicadorLegado.sigla_uf}`;
  const indicadorCanonico = indicadoresCanonicos.get(chave);
  const contexto = `Indicador ${chave}`;

  if (!indicadorCanonico) {
    throw new Error(`${contexto}: nao encontrado na legacy view canonica.`);
  }

  assertNumero(`${contexto} value`, indicadorCanonico.value, indicadorLegado.value);
  assertEqual(`${contexto} rank`, indicadorCanonico.rank, indicadorLegado.rank);
  assertEqual(`${contexto} color`, indicadorCanonico.color, indicadorLegado.color);
  assertEqual(`${contexto} state_id`, indicadorCanonico.state_id, indicadorLegado.state_id);
  assertEqual(`${contexto} indicator_name`, indicadorCanonico.indicator_name, indicadorLegado.indicator_name);
  assertEqual(`${contexto} component_id`, indicadorCanonico.component_id, indicadorLegado.component_id);
  assertEqual(`${contexto} component_name`, indicadorCanonico.component_name, indicadorLegado.component_name);
  assertEqual(`${contexto} dimension_id`, indicadorCanonico.dimension_id, indicadorLegado.dimension_id);
  assertEqual(`${contexto} dimension_name`, indicadorCanonico.dimension_name, indicadorLegado.dimension_name);
}

for (const detalheLegado of infraData.detalhamento) {
  const detalheCanonico = detalhamentoCanonico.get(detalheLegado.ID);
  const contexto = `Detalhamento ${detalheLegado.ID}`;

  if (!detalheCanonico) {
    throw new Error(`${contexto}: nao encontrado na legacy view canonica.`);
  }

  assertEqual(`${contexto} INDICADOR`, detalheCanonico.INDICADOR, detalheLegado.INDICADOR);
  assertEqual(`${contexto} ANO`, detalheCanonico.ANO, String(detalheLegado.ANO));
  assertEqual(`${contexto} FONTE`, detalheCanonico.FONTE, detalheLegado.FONTE);
  assertEqual(`${contexto} UNIDADE`, detalheCanonico.UNIDADE, detalheLegado.UNIDADE);
}

console.log(
  `Legacy view canonica Infra-BR validada: ${legacyView.infraEstados.length} estados, ${legacyView.mediasBR.length} medias, ${legacyView.dimensoes.length} dimensoes, ${legacyView.componentes.length} componentes, ${legacyView.indicadores.length} indicadores e ${legacyView.detalhamento.length} itens de detalhamento equivalentes ao consumo atual da UI.`,
);
