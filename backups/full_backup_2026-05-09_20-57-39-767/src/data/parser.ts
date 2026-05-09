import Papa from 'papaparse';
import { cdenCSV } from './cden';
import { precursorasCSV } from './precursoras';
import { fomento2025CSV } from './fomento2025';
import { fomento2026CSV } from './fomento2026';
import { patrocinioCSV } from './patrocinio2025';
import { infraData } from './infraBR_parser';
import { newFomentoCSV } from './newFomentoData';

import { EntidadeCDEN, EntidadePrecursora } from '../types';
import { adaptFomento2025, adaptFomento2026, adaptPatrocinio2025 } from './adapters';

export const parseData = () => {
  const cdenParsed = Papa.parse<EntidadeCDEN>(cdenCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const precursorasParsed = Papa.parse<EntidadePrecursora>(precursorasCSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomentoRaw = Papa.parse<any>(fomento2025CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const fomento2026Raw = Papa.parse<any>(fomento2026CSV.trim(), { header: true, skipEmptyLines: true }).data;
  const patrocinioRaw = Papa.parse<any>(patrocinioCSV.trim(), { header: true, skipEmptyLines: true }).data;
  
  const newFomentoRaw = Papa.parse<any>(newFomentoCSV.trim(), { header: true, skipEmptyLines: true, delimiter: ';' }).data;
  const newFomentoMap = new Map(newFomentoRaw.map((r: any) => [r.CNPJ, r]));

  // 2. Processamento via Adapters (Camada de Tradução)
  const fomentoHistoricoParsed = fomentoRaw.map(row => adaptFomento2025(row, cdenParsed, precursorasParsed));
  const fomento2026Parsed = fomento2026Raw.map(row => adaptFomento2026(row, cdenParsed, precursorasParsed, newFomentoMap));
  const patrocinioParsed = patrocinioRaw.map(row => adaptPatrocinio2025(row, cdenParsed, precursorasParsed));

  // 3. Retorno da Fonte da Verdade Consolidada
  return {
    cden: cdenParsed,
    precursoras: precursorasParsed,
    fomento2026: fomento2026Parsed,
    fomentoHistorico: fomentoHistoricoParsed,
    patrocinioHistorico: patrocinioParsed,
    infraBR: infraData
  };
};
