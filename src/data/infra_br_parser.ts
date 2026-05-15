import {
  InfraState,
  InfraMediaBR,
  InfraIndicador,
  InfraComponente,
  InfraDimensao,
  InfraDetalhamento
} from '../types/infra';

import { infraBRData } from './infra_br_estados';
import { mediasBRData } from './infra_br_medias_brasil';
import { dimensoesData } from './infra_br_dimensoes';
import { componentesData } from './infra_br_componentes';
import { indicadoresData } from './infra_br_indicadores';
import { detalhamentoData } from './infra_br_detalhamento_indicadores';

export const infraData = {
  infraEstados: infraBRData as InfraState[],
  mediasBR: mediasBRData as InfraMediaBR[],
  dimensoes: dimensoesData as InfraDimensao[],
  componentes: componentesData as InfraComponente[],
  indicadores: indicadoresData as InfraIndicador[],
  detalhamento: detalhamentoData as InfraDetalhamento[]
};
