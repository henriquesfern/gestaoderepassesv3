import type { InfraRuntimeData } from '../../runtime-loaders';

function compararTotal(
  divergencias: string[],
  contexto: string,
  totalCanonico: number,
  totalLegado: number,
): void {
  if (totalCanonico !== totalLegado) {
    divergencias.push(`${contexto}: canonico ${totalCanonico}, legado ${totalLegado}`);
  }
}

export function compararResumoInfraBRCanonicoLegado(
  canonico: InfraRuntimeData,
  legado: InfraRuntimeData,
): string[] {
  const divergencias: string[] = [];

  compararTotal(divergencias, 'infraEstados', canonico.infraEstados.length, legado.infraEstados.length);
  compararTotal(divergencias, 'mediasBR', canonico.mediasBR.length, legado.mediasBR.length);
  compararTotal(divergencias, 'dimensoes', canonico.dimensoes.length, legado.dimensoes.length);
  compararTotal(divergencias, 'componentes', canonico.componentes.length, legado.componentes.length);
  compararTotal(divergencias, 'indicadores', canonico.indicadores.length, legado.indicadores.length);
  compararTotal(divergencias, 'detalhamento', canonico.detalhamento.length, legado.detalhamento.length);

  return divergencias;
}
