import { detalhamentoData } from '../src/data/detalhamentoindicadores';
import { indicadoresData } from '../src/data/indicadores_0100';
import {
  infraIndicadorCanonicoSchema,
  normalizarInfraIndicadores,
} from '../src/data/canonico';

const resultado = normalizarInfraIndicadores(detalhamentoData, indicadoresData);

if (resultado.indicadores_duplicados.length > 0) {
  throw new Error(
    `Indicadores duplicados no detalhamento Infra-BR: ${resultado.indicadores_duplicados.join(', ')}`,
  );
}

if (resultado.indicadores_sem_relacao.length > 0) {
  throw new Error(
    `Indicadores sem relacionamento com componente: ${resultado.indicadores_sem_relacao.join(', ')}`,
  );
}

resultado.infra_indicadores.forEach((indicador) => {
  infraIndicadorCanonicoSchema.parse(indicador);
});

console.log(
  `Infra-BR canônico validado: ${resultado.total_indicadores} indicadores a partir de ${resultado.total_linhas_origem} linhas de detalhamento.`,
);
