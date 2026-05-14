import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function run(command: string) {
  return execSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function checkNodeVersion() {
  const version = process.versions.node;
  const major = Number(version.split('.')[0] ?? '0');
  const ok = major >= 20;
  return {
    ok,
    message: ok
      ? `Node.js ${version} compatível com o projeto.`
      : `Node.js ${version} incompatível. Use Node.js 20 ou superior.`,
  };
}

function checkPath(pathname: string, successMessage: string, failMessage: string) {
  const ok = existsSync(resolve(process.cwd(), pathname));
  return {
    ok,
    message: ok ? successMessage : failMessage,
  };
}

function checkVercelCli() {
  try {
    const command = process.platform === 'win32' ? 'npx.cmd vercel --version' : 'npx vercel --version';
    const version = run(command);
    return {
      ok: true,
      message: `Vercel CLI disponível (${version}).`,
    };
  } catch {
    return {
      ok: false,
      message: 'Vercel CLI indisponível. Rode `npm run dev:vercel` ou instale/configure o CLI antes de testar funções da Vercel.',
    };
  }
}

function printResult(title: string, ok: boolean, message: string) {
  console.log(`${ok ? '[OK]' : '[ATENCAO]'} ${title}: ${message}`);
}

function doctor() {
  console.log('Diagnóstico local do projeto');
  console.log(`Workspace: ${process.cwd()}`);
  console.log('');

  const checks = [
    ['Node.js', checkNodeVersion()],
    [
      'Dependências',
      checkPath(
        'node_modules',
        'node_modules presente. Você já pode rodar os scripts locais.',
        'node_modules não encontrado. Rode `npm install` antes de iniciar o ambiente local.',
      ),
    ],
    [
      '.env.local',
      checkPath(
        '.env.local',
        '.env.local encontrado. O projeto já possui variáveis locais configuradas.',
        '.env.local ausente. Para testes com IA/API, rode `npm run dev:env:pull` ou crie o arquivo a partir de `.env.example`.',
      ),
    ],
    [
      'Vínculo com Vercel',
      checkPath(
        '.vercel/project.json',
        'Projeto vinculado à Vercel localmente.',
        'Arquivo `.vercel/project.json` ausente. Refaça o vínculo da Vercel antes de usar `vercel dev`.',
      ),
    ],
    ['Vercel CLI', checkVercelCli()],
  ] as const;

  checks.forEach(([title, result]) => printResult(title, result.ok, result.message));

  console.log('');
  console.log('Fluxos recomendados:');
  console.log('- UI rápida: `npm run dev:ui`');
  console.log('- Simulação da Vercel com API/IA: `npm run dev:vercel`');
  console.log('- Preview local do build: `npm run dev:preview`');
  console.log('- Checagem antes de PR: `npm run dev:check`');
}

function main() {
  const [, , command] = process.argv;

  switch (command) {
    case 'doctor':
      doctor();
      break;
    default:
      console.log('Uso:');
      console.log('  npm run dev:doctor');
      process.exit(command ? 1 : 0);
  }
}

main();
