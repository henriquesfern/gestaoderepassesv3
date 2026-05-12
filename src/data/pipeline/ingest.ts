import Papa from 'papaparse';
import { cdenCSV } from '../cden';
import { precursorasCSV } from '../precursoras';
import { fomento2025CSV } from '../fomento2025';
import { fomento2026CSV } from '../fomento2026';
import { patrocinioCSV } from '../patrocinio2025';
import { newFomentoCSV } from '../newFomentoData';
import { gestaofomento26 } from '../gestaofomento26';
import type { EntidadeCDEN, EntidadePrecursora } from '../../types';
import type { ParsedRawData } from './types';

const normalizeCNPJ = (cnpj: string) => (cnpj || '').replace(/\D/g, '');

export function ingestRawData(): ParsedRawData {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomentoRaw = Papa.parse<any>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<any>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<any>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true }).data;

  const newFomentoRaw = Papa.parse<any>(newFomentoCSV.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: ';'
  }).data;

  const newFomentoMap = new Map(newFomentoRaw.map((r: any) => [normalizeCNPJ(r.CNPJ), r]));
  const gestao26Map = new Map(gestaofomento26.map(r => [normalizeCNPJ(r.cnpj), r]));

  return {
    cdenParsed,
    precursorasParsed,
    fomentoRaw,
    fomento2026Raw,
    patrocinioRaw,
    newFomentoMap,
    gestao26Map
  };
}