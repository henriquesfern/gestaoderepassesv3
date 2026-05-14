import { readFile } from 'fs/promises';
import path from 'path';
import { parseData } from '../src/data/parser';
import { appDataSchema } from '../src/data/schema';

async function runValidation() {
  console.log('Iniciando a validação estrutural dos dados (Integração Zod + Vercel/GitHub CI)...');

  const publicDataDir = path.resolve(process.cwd(), 'public', 'data');
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const target = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (target.startsWith('/data/')) {
      const fileName = target.replace('/data/', '');
      const text = await readFile(path.join(publicDataDir, fileName), 'utf8');
      return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    return originalFetch(input as any, init);
  };

  try {
    const appData = await parseData();
    appDataSchema.parse(appData);
    console.log('Dados validados com sucesso! A estrutura CSV e a conversão de tipos estão consistentes.');
    console.log(
      `Validado: ${appData.fomento2026.length} projetos 2026, ` +
      `${appData.fomentoHistorico.length} histórico fomento, ` +
      `${appData.patrocinioHistorico.length} histórico patrocínio.`
    );
    process.exit(0);
  } catch (error: any) {
    console.error('ERRO NA VALIDAÇÃO DOS DADOS!');
    console.error('Um erro estrutural foi encontrado no processo de parsing dos dados.');
    console.error('Detalhes do erro:');

    if (error.errors) {
      const appData = await parseData();

      error.errors.forEach((issue: any) => {
        const pathStr = issue.path.join('.');
        let extraInfo = '';

        if (issue.path[0] === 'fomento2026' && typeof issue.path[1] === 'number') {
          const row = (appData as any).fomento2026[issue.path[1]];
          extraInfo = ` | Entidade: "${row.ENTIDADE}" | Valor CNPJ: "${row?.CNPJ}"`;
        }

        console.error(`- Em ${pathStr}: ${issue.message}${extraInfo}`);
      });
    } else {
      console.error(error);
    }

    console.error('\nCom o pipeline configurado, o Vercel impedirá este deploy com erro, possibilitando rollback e revisão segura via GitHub.');
    process.exit(1);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runValidation();
