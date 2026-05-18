import { compararResumoInfraBRCanonicoLegado, loadInfraBRCanonicoRuntimeData } from '../src/data/canonico/adapters';
import { infraData } from '../src/data/infra_br_parser';

const runtimeCanonico = loadInfraBRCanonicoRuntimeData();
const divergencias = compararResumoInfraBRCanonicoLegado(runtimeCanonico, infraData);

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

if (divergencias.length > 0) {
  throw new Error(`Loader canonico Infra-BR com divergencias de total: ${divergencias.join('; ')}`);
}

const acreCanonico = runtimeCanonico.infraEstados.find((estado) => estado.sigla_uf === 'AC');
const acreLegado = infraData.infraEstados.find((estado) => estado.sigla_uf === 'AC');
const portosCanonico = runtimeCanonico.componentes.find(
  (componente) => componente.sigla_uf === 'AC' && componente.component_name === 'PORTOS',
);
const portosLegado = infraData.componentes.find(
  (componente) => componente.sigla_uf === 'AC' && componente.component_name === 'PORTOS',
);
const volumePortuarioCanonico = runtimeCanonico.indicadores.find(
  (indicador) => indicador.sigla_uf === 'AC' && indicador.indicator_id === 'mob_portos_4',
);
const volumePortuarioLegado = infraData.indicadores.find(
  (indicador) => indicador.sigla_uf === 'AC' && indicador.indicator_id === 'mob_portos_4',
);

if (!acreCanonico || !acreLegado) {
  throw new Error('Estado AC nao encontrado para validar o loader canonico Infra-BR.');
}

if (!portosCanonico || !portosLegado) {
  throw new Error('Componente PORTOS do AC nao encontrado para validar o loader canonico Infra-BR.');
}

if (!volumePortuarioCanonico || !volumePortuarioLegado) {
  throw new Error('Indicador mob_portos_4 do AC nao encontrado para validar o loader canonico Infra-BR.');
}

assertNumero('AC infra_br', acreCanonico.infra_br, acreLegado.infra_br);
assertEqual('AC rank', acreCanonico.rank, acreLegado.rank);
assertNumero('AC PORTOS value', portosCanonico.value, portosLegado.value);
assertEqual('AC PORTOS dimension_name', portosCanonico.dimension_name, portosLegado.dimension_name);
assertNumero('AC mob_portos_4 value', volumePortuarioCanonico.value, volumePortuarioLegado.value);
assertEqual('AC mob_portos_4 fonte', volumePortuarioCanonico.fonte, volumePortuarioLegado.fonte);

console.log(
  `Loader canonico paralelo Infra-BR validado: ${runtimeCanonico.infraEstados.length} estados, ${runtimeCanonico.dimensoes.length} dimensoes, ${runtimeCanonico.componentes.length} componentes, ${runtimeCanonico.indicadores.length} indicadores e ${runtimeCanonico.detalhamento.length} itens de detalhamento equivalentes ao consumo atual.`,
);
