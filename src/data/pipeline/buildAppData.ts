import { infraData } from '../infra_br_parser';
import { ingestRawData } from './ingest';
import { transformData } from './transform';

export function buildAppData() {
  const raw = ingestRawData();
  const transformed = transformData(raw);

  return {
    ...transformed,
    infraBR: infraData
  };
}
