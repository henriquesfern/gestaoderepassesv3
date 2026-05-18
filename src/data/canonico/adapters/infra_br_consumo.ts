import type { InfraRuntimeData } from '../../runtime-loaders';
import { carregarInfraBRLegacyViewCanonica } from './infra_br_legacy_view';

export type OrigemConsumoInfraBR = 'canonica' | 'legada';

export interface ConsumoInfraBRSelecionado {
  data: InfraRuntimeData;
  origem: OrigemConsumoInfraBR;
  divergencias: string[];
}

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

export function selecionarInfraBRParaConsumo(legado: InfraRuntimeData): ConsumoInfraBRSelecionado {
  try {
    const canonico = carregarInfraBRLegacyViewCanonica();
    const divergencias = compararResumoInfraBRCanonicoLegado(canonico, legado);

    if (divergencias.length === 0) {
      return {
        data: canonico,
        origem: 'canonica',
        divergencias,
      };
    }

    return {
      data: legado,
      origem: 'legada',
      divergencias,
    };
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);

    return {
      data: legado,
      origem: 'legada',
      divergencias: [`Falha ao carregar legacy view canonica: ${mensagem}`],
    };
  }
}
