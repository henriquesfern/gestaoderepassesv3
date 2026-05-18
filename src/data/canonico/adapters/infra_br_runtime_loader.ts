import type { InfraRuntimeData } from '../../runtime-loaders';
import { carregarInfraBRLegacyViewCanonica } from './infra_br_legacy_view';

export function loadInfraBRCanonicoRuntimeData(): InfraRuntimeData {
  return carregarInfraBRLegacyViewCanonica();
}
