import {
  infraComponenteCanonicoSchema,
  infraDetalheIndicadorCanonicoSchema,
  infraDimensaoCanonicaSchema,
  infraEstadoCanonicoSchema,
  infraIndicadorCanonicoSchema,
  infraValorComponenteCanonicoSchema,
  infraValorDimensaoCanonicoSchema,
} from '../src/data/canonico';
import { carregarInfraBRCanonico, criarIndicesCanonicosInfraBR } from '../src/data/canonico/adapters';

const modelo = carregarInfraBRCanonico();
const indices = criarIndicesCanonicosInfraBR(modelo);

const totaisEsperados = {
  estados: 27,
  dimensoes: 6,
  valoresDimensoes: 162,
  componentes: 20,
  valoresComponentes: 540,
  indicadores: 67,
  detalhesIndicadores: 1809,
};

function validarTotal(nome: string, atual: number, esperado: number): void {
  if (atual !== esperado) {
    throw new Error(`Total invalido em ${nome}: esperado ${esperado}, encontrado ${atual}.`);
  }
}

validarTotal('infra_estados', modelo.infra_estados.length, totaisEsperados.estados);
validarTotal('infra_dimensoes', modelo.infra_dimensoes.length, totaisEsperados.dimensoes);
validarTotal('infra_valores_dimensoes', modelo.infra_valores_dimensoes.length, totaisEsperados.valoresDimensoes);
validarTotal('infra_componentes', modelo.infra_componentes.length, totaisEsperados.componentes);
validarTotal(
  'infra_valores_componentes',
  modelo.infra_valores_componentes.length,
  totaisEsperados.valoresComponentes,
);
validarTotal('infra_indicadores', modelo.infra_indicadores.length, totaisEsperados.indicadores);
validarTotal(
  'infra_detalhes_indicadores',
  modelo.infra_detalhes_indicadores.length,
  totaisEsperados.detalhesIndicadores,
);

modelo.infra_estados.forEach((estado) => infraEstadoCanonicoSchema.parse(estado));
modelo.infra_dimensoes.forEach((dimensao) => infraDimensaoCanonicaSchema.parse(dimensao));
modelo.infra_valores_dimensoes.forEach((valorDimensao) => infraValorDimensaoCanonicoSchema.parse(valorDimensao));
modelo.infra_componentes.forEach((componente) => infraComponenteCanonicoSchema.parse(componente));
modelo.infra_valores_componentes.forEach((valorComponente) =>
  infraValorComponenteCanonicoSchema.parse(valorComponente),
);
modelo.infra_indicadores.forEach((indicador) => infraIndicadorCanonicoSchema.parse(indicador));
modelo.infra_detalhes_indicadores.forEach((detalheIndicador) =>
  infraDetalheIndicadorCanonicoSchema.parse(detalheIndicador),
);

for (const valorDimensao of modelo.infra_valores_dimensoes) {
  if (!indices.estados_por_uf.has(valorDimensao.uf)) {
    throw new Error(`Valor por dimensao sem UF indexada: ${valorDimensao.valor_dimensao_id}.`);
  }

  if (!indices.dimensoes_por_id.has(valorDimensao.dimensao_id)) {
    throw new Error(`Valor por dimensao sem dimensao indexada: ${valorDimensao.valor_dimensao_id}.`);
  }
}

for (const valorComponente of modelo.infra_valores_componentes) {
  if (!indices.estados_por_uf.has(valorComponente.uf)) {
    throw new Error(`Valor por componente sem UF indexada: ${valorComponente.valor_componente_id}.`);
  }

  if (!indices.componentes_por_id.has(valorComponente.componente_id)) {
    throw new Error(`Valor por componente sem componente indexado: ${valorComponente.valor_componente_id}.`);
  }

  if (!indices.dimensoes_por_id.has(valorComponente.dimensao_id)) {
    throw new Error(`Valor por componente sem dimensao indexada: ${valorComponente.valor_componente_id}.`);
  }
}

for (const indicador of modelo.infra_indicadores) {
  if (!indices.componentes_por_id.has(indicador.componente_id)) {
    throw new Error(`Indicador sem componente indexado: ${indicador.indicador_id}.`);
  }
}

for (const detalheIndicador of modelo.infra_detalhes_indicadores) {
  if (!indices.estados_por_uf.has(detalheIndicador.uf)) {
    throw new Error(`Detalhe por indicador sem UF indexada: ${detalheIndicador.detalhe_indicador_id}.`);
  }

  if (!indices.indicadores_por_id.has(detalheIndicador.indicador_id)) {
    throw new Error(`Detalhe por indicador sem indicador indexado: ${detalheIndicador.detalhe_indicador_id}.`);
  }
}

console.log(
  `Adapter canonico Infra-BR validado: ${modelo.infra_estados.length} estados, ${modelo.infra_dimensoes.length} dimensoes, ${modelo.infra_valores_dimensoes.length} valores por dimensao, ${modelo.infra_componentes.length} componentes, ${modelo.infra_valores_componentes.length} valores por componente, ${modelo.infra_indicadores.length} indicadores e ${modelo.infra_detalhes_indicadores.length} detalhes por indicador.`,
);
