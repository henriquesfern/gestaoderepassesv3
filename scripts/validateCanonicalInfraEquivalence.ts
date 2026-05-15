import { infraData } from '../src/data/infra_br_parser';
import { carregarInfraBRCanonico, criarIndicesCanonicosInfraBR } from '../src/data/canonico/adapters';
import type { UnidadeFederativa } from '../src/data/canonico';

const modelo = carregarInfraBRCanonico();
const indices = criarIndicesCanonicosInfraBR(modelo);

function assertEqual<T>(contexto: string, atual: T, esperado: T): void {
  if (atual !== esperado) {
    throw new Error(`${contexto}: esperado ${String(esperado)}, encontrado ${String(atual)}.`);
  }
}

function assertNumero(contexto: string, atual: number | undefined, esperado: number): void {
  if (atual === undefined || Math.abs(atual - esperado) > 0.000001) {
    throw new Error(`${contexto}: esperado ${esperado}, encontrado ${String(atual)}.`);
  }
}

function colorParaClasse(color: number): string {
  return `classe_${color}`;
}

function ufCanonica(uf: string): UnidadeFederativa {
  return uf as UnidadeFederativa;
}

assertEqual('Total de estados', modelo.infra_estados.length, infraData.infraEstados.length);
assertEqual('Total de valores por dimensao', modelo.infra_valores_dimensoes.length, infraData.dimensoes.length);
assertEqual('Total de valores por componente', modelo.infra_valores_componentes.length, infraData.componentes.length);
assertEqual('Total de detalhes por indicador', modelo.infra_detalhes_indicadores.length, infraData.indicadores.length);

for (const estadoLegado of infraData.infraEstados) {
  const estadoCanonico = indices.estados_por_uf.get(ufCanonica(estadoLegado.sigla_uf));
  const contexto = `Estado ${estadoLegado.sigla_uf}`;

  if (!estadoCanonico) {
    throw new Error(`${contexto}: nao encontrado no adapter canonico.`);
  }

  assertNumero(`${contexto} infra_br`, estadoCanonico.infra_br, estadoLegado.infra_br);
  assertEqual(`${contexto} estado_id`, estadoCanonico.estado_id, String(estadoLegado.state_id));
  assertEqual(`${contexto} ranking`, estadoCanonico.ranking, estadoLegado.rank);
  assertEqual(`${contexto} cor_classe`, estadoCanonico.cor_classe, colorParaClasse(estadoLegado.color));
}

for (const dimensaoLegada of infraData.dimensoes) {
  const chave = `${dimensaoLegada.dimension_id}__${dimensaoLegada.sigla_uf}`;
  const valorCanonico = modelo.infra_valores_dimensoes.find((valor) => valor.valor_dimensao_id === chave);
  const contexto = `Valor dimensao ${chave}`;

  if (!valorCanonico) {
    throw new Error(`${contexto}: nao encontrado no adapter canonico.`);
  }

  assertNumero(`${contexto} valor`, valorCanonico.valor, dimensaoLegada.value);
  assertEqual(`${contexto} estado_id`, valorCanonico.estado_id, String(dimensaoLegada.state_id));
  assertEqual(`${contexto} ranking`, valorCanonico.ranking, dimensaoLegada.rank);
  assertEqual(`${contexto} cor_classe`, valorCanonico.cor_classe, colorParaClasse(dimensaoLegada.color));
}

for (const componenteLegado of infraData.componentes) {
  const chave = `${componenteLegado.component_id}__${componenteLegado.sigla_uf}`;
  const valorCanonico = modelo.infra_valores_componentes.find((valor) => valor.valor_componente_id === chave);
  const contexto = `Valor componente ${chave}`;

  if (!valorCanonico) {
    throw new Error(`${contexto}: nao encontrado no adapter canonico.`);
  }

  assertNumero(`${contexto} valor`, valorCanonico.valor, componenteLegado.value);
  assertEqual(`${contexto} dimensao_id`, valorCanonico.dimensao_id, componenteLegado.dimension_id);
  assertEqual(`${contexto} estado_id`, valorCanonico.estado_id, String(componenteLegado.state_id));
  assertEqual(`${contexto} ranking`, valorCanonico.ranking, componenteLegado.rank);
  assertEqual(`${contexto} cor_classe`, valorCanonico.cor_classe, colorParaClasse(componenteLegado.color));
}

for (const indicadorLegado of infraData.indicadores) {
  const chave = `${indicadorLegado.indicator_id}__${indicadorLegado.sigla_uf}`;
  const detalheCanonico = modelo.infra_detalhes_indicadores.find((detalhe) => detalhe.detalhe_indicador_id === chave);
  const indicadorCanonico = indices.indicadores_por_id.get(indicadorLegado.indicator_id);
  const contexto = `Detalhe indicador ${chave}`;

  if (!detalheCanonico) {
    throw new Error(`${contexto}: nao encontrado no adapter canonico.`);
  }

  if (!indicadorCanonico) {
    throw new Error(`${contexto}: indicador nao encontrado no cadastro canonico.`);
  }

  assertNumero(`${contexto} valor`, detalheCanonico.valor, indicadorLegado.value);
  assertEqual(`${contexto} ranking`, detalheCanonico.ranking, indicadorLegado.rank);
  assertEqual(`${contexto} cor_classe`, detalheCanonico.cor_classe, colorParaClasse(indicadorLegado.color));
  assertEqual(`${contexto} componente_id`, indicadorCanonico.componente_id, indicadorLegado.component_id);
}

console.log(
  `Equivalencia Infra-BR validada: ${infraData.infraEstados.length} estados, ${infraData.dimensoes.length} valores por dimensao, ${infraData.componentes.length} valores por componente e ${infraData.indicadores.length} detalhes por indicador equivalentes ao consumo atual da UI.`,
);
