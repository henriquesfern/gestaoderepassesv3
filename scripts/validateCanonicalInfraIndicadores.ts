import { componentesData } from '../src/data/infra_br_componentes';
import { detalhamentoData } from '../src/data/infra_br_detalhamento_indicadores';
import { dimensoesData } from '../src/data/infra_br_dimensoes';
import { infraBRData } from '../src/data/infra_br_estados';
import { indicadoresData } from '../src/data/infra_br_indicadores';
import {
  infraComponenteCanonicoSchema,
  infraDimensaoCanonicaSchema,
  infraEstadoCanonicoSchema,
  infraIndicadorCanonicoSchema,
  normalizarInfraEstrutura,
  normalizarInfraEstados,
  normalizarInfraIndicadores,
} from '../src/data/canonico';

const estados = normalizarInfraEstados(infraBRData);
const estrutura = normalizarInfraEstrutura(dimensoesData, componentesData);
const indicadores = normalizarInfraIndicadores(detalhamentoData, indicadoresData);

if (estados.ufs_invalidas.length > 0) {
  throw new Error(`UFs invalidas no Infra-BR estados: ${estados.ufs_invalidas.join(', ')}`);
}

if (estados.ufs_duplicadas.length > 0) {
  throw new Error(`UFs duplicadas no Infra-BR estados: ${estados.ufs_duplicadas.join(', ')}`);
}

if (estados.ufs_ausentes.length > 0) {
  throw new Error(`UFs ausentes no Infra-BR estados: ${estados.ufs_ausentes.join(', ')}`);
}

if (estados.rankings_invalidos.length > 0) {
  throw new Error(`Rankings invalidos no Infra-BR estados: ${estados.rankings_invalidos.join(', ')}`);
}

if (estados.classes_invalidas.length > 0) {
  throw new Error(`Classes de cor invalidas no Infra-BR estados: ${estados.classes_invalidas.join(', ')}`);
}

if (estrutura.componentes_sem_dimensao.length > 0) {
  throw new Error(
    `Componentes sem relacionamento com dimensao: ${estrutura.componentes_sem_dimensao.join(', ')}`,
  );
}

if (indicadores.indicadores_duplicados.length > 0) {
  throw new Error(
    `Indicadores duplicados no detalhamento Infra-BR: ${indicadores.indicadores_duplicados.join(', ')}`,
  );
}

if (indicadores.indicadores_sem_relacao.length > 0) {
  throw new Error(
    `Indicadores sem relacionamento com componente: ${indicadores.indicadores_sem_relacao.join(', ')}`,
  );
}

estados.infra_estados.forEach((estado) => {
  infraEstadoCanonicoSchema.parse(estado);
});

estrutura.infra_dimensoes.forEach((dimensao) => {
  infraDimensaoCanonicaSchema.parse(dimensao);
});

estrutura.infra_componentes.forEach((componente) => {
  infraComponenteCanonicoSchema.parse(componente);
});

indicadores.infra_indicadores.forEach((indicador) => {
  infraIndicadorCanonicoSchema.parse(indicador);
});

console.log(
  `Infra-BR canonico validado: ${estados.infra_estados.length} estados, ${estrutura.infra_dimensoes.length} dimensoes, ${estrutura.infra_componentes.length} componentes e ${indicadores.total_indicadores} indicadores.`,
);
