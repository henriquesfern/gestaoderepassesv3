import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { gestaofomento26 } from './gestaofomento26';
import { fetchStaticText, parseCsvRows } from './runtime-loaders';

import { EntidadeCDEN, EntidadePrecursora } from '../types';
import { adaptFomento2025, adaptFomento2026, adaptPatrocinio2025 } from './adapters';
import { loadInfraBRCanonicoRuntimeData } from './canonico/adapters';
import type { RawFomento2025Row, RawFomento2026Row, RawPatrocinio2025Row, GestaoFomento26Row } from './types';

export const parseData = async () => {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const [
    fomento2025Text,
    fomento2026Text,
    patrocinio2025Text,
    newFomentoText,
  ] = await Promise.all([
    fetchStaticText('fomento2025.csv'),
    fetchStaticText('fomento2026.csv'),
    fetchStaticText('patrocinio2025.csv'),
    fetchStaticText('GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv'),
  ]);
  const infraData = loadInfraBRCanonicoRuntimeData();

  const fomentoRaw = parseCsvRows<RawFomento2025Row>(fomento2025Text);
  const fomento2026Raw = parseCsvRows<RawFomento2026Row>(fomento2026Text);
  const patrocinioRaw = parseCsvRows<RawPatrocinio2025Row>(patrocinio2025Text);
  const newFomentoRaw = parseCsvRows<RawFomento2026Row>(newFomentoText, { delimiter: ';' });
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
