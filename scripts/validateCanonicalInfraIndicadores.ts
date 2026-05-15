import { componentesData } from '../src/data/componentes_0100';
import { detalhamentoData } from '../src/data/detalhamentoindicadores';
import { dimensoesData } from '../src/data/dimensoes_0100';
import { indicadoresData } from '../src/data/indicadores_0100';
import {
  infraComponenteCanonicoSchema,
  infraDimensaoCanonicaSchema,
  infraIndicadorCanonicoSchema,
  normalizarInfraEstrutura,
  normalizarInfraIndicadores,
} from '../src/data/canonico';

const estrutura = normalizarInfraEstrutura(dimensoesData, componentesData);
const indicadores = normalizarInfraIndicadores(detalhamentoData, indicadoresData);

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
  `Infra-BR canônico validado: ${estrutura.infra_dimensoes.length} dimensões, ${estrutura.infra_componentes.length} componentes e ${indicadores.total_indicadores} indicadores.`,
);
