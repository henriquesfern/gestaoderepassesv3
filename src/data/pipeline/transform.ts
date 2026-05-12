import { adaptFomento2025, adaptFomento2026, adaptPatrocinio2025 } from '../adapters';
import type { ParsedRawData } from './types';

export function transformData(raw: ParsedRawData) {
  const fomentoHistoricoParsed = raw.fomentoRaw.map(row =>
    adaptFomento2025(row, raw.cdenParsed, raw.precursorasParsed)
  );

  const fomento2026Parsed = raw.fomento2026Raw.map(row =>
    adaptFomento2026(
      row,
      raw.cdenParsed,
      raw.precursorasParsed,
      raw.newFomentoMap,
      raw.gestao26Map
    )
  );

  const patrocinioParsed = raw.patrocinioRaw.map(row =>
    adaptPatrocinio2025(row, raw.cdenParsed, raw.precursorasParsed)
  );

  return {
    cden: raw.cdenParsed,
    precursoras: raw.precursorasParsed,
    fomento2026: fomento2026Parsed,
    fomentoHistorico: fomentoHistoricoParsed,
    patrocinioHistorico: patrocinioParsed
  };
}