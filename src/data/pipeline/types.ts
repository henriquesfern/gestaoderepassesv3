import type { EntidadeCDEN, EntidadePrecursora } from '../../types';

export interface ParsedRawData {
  cdenParsed: EntidadeCDEN[];
  precursorasParsed: EntidadePrecursora[];
  fomentoRaw: any[];
  fomento2026Raw: any[];
  patrocinioRaw: any[];
  newFomentoMap: Map<string, any>;
  gestao26Map: Map<string, any>;
}