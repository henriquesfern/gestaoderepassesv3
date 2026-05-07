import {
  InfraState,
  InfraMediaBR,
  InfraIndicador,
  InfraComponente,
  InfraDimensao,
  InfraDetalhamento
} from './infraBR_types';

import { infraBRData } from './infra-br';
import { mediasBRData } from './medias_BR';
import { dimensoesData } from './dimensoes_0100';
import { componentesData } from './componentes_0100';
import { indicadoresData } from './indicadores_0100';
import { detalhamentoData } from './detalhamentoindicadores';

export const infraData = {
  infraEstados: infraBRData as InfraState[],
  mediasBR: mediasBRData as InfraMediaBR[],
  dimensoes: dimensoesData as InfraDimensao[],
  componentes: componentesData as InfraComponente[],
  indicadores: indicadoresData as InfraIndicador[],
  detalhamento: detalhamentoData as InfraDetalhamento[]
};
