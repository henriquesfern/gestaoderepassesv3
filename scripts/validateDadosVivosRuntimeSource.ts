import { readFile } from 'fs/promises';
import path from 'path';
import { appDataSchema } from '../src/data/schema';
import {
  FONTE_PROJETOS_RUNTIME_PADRAO,
  parseData,
  type FonteProjetosRuntime,
} from '../src/data/parser';

type AppData = Awaited<ReturnType<typeof parseData>>;

async function comFetchLocal<T>(acao: () => Promise<T>): Promise<T> {
  const publicDataDir = path.resolve(process.cwd(), 'public', 'data');
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (target.startsWith('/data/')) {
      const fileName = target.replace('/data/', '');
      const text = await readFile(path.join(publicDataDir, fileName), 'utf8');
      return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    return originalFetch(input as never, init);
  };

  try {
    return await acao();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function resumo(appData: AppData): string {
  return [
    `fomento2026=${appData.fomento2026.length}`,
    `fomentoHistorico=${appData.fomentoHistorico.length}`,
    `patrocinioHistorico=${appData.patrocinioHistorico.length}`,
  ].join(', ');
}

function assertMesmoJson(codigo: string, a: unknown, b: unknown): void {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(codigo);
  }
}

async function validarFonte(fonteProjetos?: FonteProjetosRuntime): Promise<AppData> {
  const appData = await comFetchLocal(() => parseData(fonteProjetos ? { fonteProjetos } : undefined));
  appDataSchema.parse(appData);
  return appData;
}

async function main(): Promise<void> {
  const padrao = await validarFonte();
  const legadoExplicito = await validarFonte('legado');
  const dadosVivos = await validarFonte('dados-vivos');

  assertMesmoJson('FONTE_RUNTIME_PADRAO_DIFERE_DE_LEGADO_EXPLICITO', padrao, legadoExplicito);

  console.log('Fonte controlada de projetos validada com sucesso.');
  console.log(`Fonte padrao: ${FONTE_PROJETOS_RUNTIME_PADRAO}`);
  console.log(`Legado: ${resumo(legadoExplicito)}`);
  console.log(`Dados vivos: ${resumo(dadosVivos)}`);
}

main();
