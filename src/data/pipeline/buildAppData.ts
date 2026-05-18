import { loadInfraBRCanonicoRuntimeData } from '../canonico/adapters';
import { ingestRawData } from './ingest';
import { transformData } from './transform';

export function buildAppData() {
  const raw = ingestRawData();
  const transformed = transformData(raw);

  return {
    ...transformed,
    infraBR: loadInfraBRCanonicoRuntimeData()
  };
}
