import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { fomento2025CSV } from './fomento2025';
import { fomento2026CSV } from './fomento2026';
import { patrocinioCSV } from './patrocinio2025';
import { infraData } from './infraBR_parser';
import { newFomentoCSV } from './newFomentoData';
import { gestaofomento26 } from './gestaofomento26';

import { EntidadeCDEN, EntidadePrecursora } from '../types';
import { adaptFomento2025, adaptFomento2026, adaptPatrocinio2025 } from './adapters';
import type { RawFomento2025Row, RawFomento2026Row, RawPatrocinio2025Row, GestaoFomento26Row } from './types';

export const parseData = () => {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const fomentoRaw = Papa.parse<RawFomento2025Row>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<RawFomento2026Row>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<RawPatrocinio2025Row>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const newFomentoRaw = Papa.parse<RawFomento2026Row>(newFomentoCSV.trim(), { header: true, skipEmptyLines: true, delimiter: ';' }).data;
  const normalizeCNPJ = (cnpj: string) => cnpj.replace(/\D/g, '');

  const newFomentoMap = new Map<string, RawFomento2026Row>(
    newFomentoRaw.map((r) => [normalizeCNPJ(r.CNPJ || ''), r])
  );

  const gestao26Map = new Map<string, GestaoFomento26Row>(
    gestaofomento26.map((r: GestaoFomento26Row) => [normalizeCNPJ(r.cnpj), r])
  );

  const fomentoHistoricoParsed = fomentoRaw.map(row => adaptFomento2025(row, cdenParsed, precursorasParsed));
  const fomento2026Parsed = fomento2026Raw.map(row => adaptFomento2026(row, cdenParsed, precursorasParsed, newFomentoMap, gestao26Map));
  const patrocinioParsed = patrocinioRaw.map(row => adaptPatrocinio2025(row, cdenParsed, precursorasParsed));

  return {
    cden: cdenParsed,
    precursoras: precursorasParsed,
    fomento2026: fomento2026Parsed,
    fomentoHistorico: fomentoHistoricoParsed,
    patrocinioHistorico: patrocinioParsed,
    infraBR: infraData
  };
};