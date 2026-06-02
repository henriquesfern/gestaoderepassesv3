import { execSync } from 'node:child_process';

function npmRun(command: string): string {
  return process.platform === 'win32' ? `npm.cmd run ${command}` : `npm run ${command}`;
}

function runStep(title: string, command: string) {
  console.log(`\n[etapa] ${title}`);
  console.log(`[cmd] ${command}`);

  execSync(command, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

function main() {
  console.log('Fluxo guiado de atualizacao do Fomento 2026');
  console.log(`Workspace: ${process.cwd()}`);

  runStep(
    'Validar arquivos reais consumidos pelo runtime',
    npmRun('data:validate-fomento2026-runtime-files'),
  );

  runStep(
    'Confirmar leitura direta do acompanhamento operacional',
    npmRun('data:sync-fomento2026-acompanhamento'),
  );

  runStep(
    'Executar checagem completa do projeto',
    npmRun('dev:check'),
  );

  console.log('\nFluxo do Fomento 2026 concluido com sucesso.');
  console.log('Arquivos reais validados, runtime confirmado e projeto verificado.');
}

main();
