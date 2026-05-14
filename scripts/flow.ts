import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { CHANGELOG_HEADER, CHANGELOG_PATH, getChangelogBody, hasPendingEntries, resetChangelog } from './lib/changelog.js';

const PR_BODY_PATH = resolve(process.cwd(), '.tmp', 'pr-body.md');

function run(command: string) {
  return execSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function getCurrentBranch() {
  return run('git branch --show-current');
}

function getGitStatus() {
  return run('git status --short');
}

function ensureWorkingBranch() {
  const branch = getCurrentBranch();
  if (branch === 'main' || branch === 'producao') {
    throw new Error(`O branch atual é "${branch}". Abra o PR a partir de um branch de trabalho derivado da main.`);
  }
  return branch;
}

function writePrBody(branch: string) {
  mkdirSync(resolve(process.cwd(), '.tmp'), { recursive: true });
  const body = getChangelogBody() || 'Nenhuma pendência registrada no changelog.';

  const content = [
    '## Resumo',
    '',
    `Sincronismo operacional do branch \`${branch}\`.`,
    '',
    '## Entregas',
    '',
    body,
    '',
    '## Validações',
    '',
    '- `npm run build`',
    '- `npm run lint`',
    '',
  ].join('\n');

  writeFileSync(PR_BODY_PATH, content, 'utf8');
}

function main() {
  const [, , command, ...args] = process.argv;
  const commitAfterReset = args.includes('--commit');

  switch (command) {
    case 'status': {
      console.log(`Branch atual: ${getCurrentBranch()}`);
      console.log(`Workspace limpo: ${getGitStatus() ? 'não' : 'sim'}`);
      console.log(`Changelog com pendências: ${hasPendingEntries() ? 'sim' : 'não'}`);
      console.log(`Changelog local: ${CHANGELOG_PATH}`);
      break;
    }
    case 'prepare-pr': {
      const branch = ensureWorkingBranch();

      if (!hasPendingEntries()) {
        throw new Error('O CHANGELOG_PENDING.md local está vazio. Registre as entregas antes de abrir o PR.');
      }

      console.log('Executando build...');
      execSync('npm.cmd run build', { cwd: process.cwd(), stdio: 'inherit' });

      console.log('Executando lint/typecheck...');
      execSync('npm.cmd run lint', { cwd: process.cwd(), stdio: 'inherit' });

      writePrBody(branch);

      console.log(`PR body gerado em ${PR_BODY_PATH}`);
      break;
    }
    case 'finalize-main': {
      const branch = getCurrentBranch();
      if (branch !== 'main') {
        throw new Error('O comando flow:finalize-main deve ser executado na branch main.');
      }

      resetChangelog();
      console.log('CHANGELOG_PENDING.md local reiniciado com sucesso.');
      console.log('Arquivo mantido apenas localmente; nenhum commit de limpeza é necessário.');

      if (existsSync(PR_BODY_PATH)) {
        writeFileSync(PR_BODY_PATH, '', 'utf8');
      }

      if (commitAfterReset) {
        console.log('A opção --commit foi mantida por compatibilidade, mas o changelog pendente agora é local e ignorado pelo Git.');
      }
      break;
    }
    default: {
      console.log('Uso:');
      console.log('  npm run flow:status');
      console.log('  npm run flow:prepare-pr');
      console.log('  npm run flow:finalize-main');
      console.log('  npm run flow:finalize-main -- --commit');
      console.log(`Cabeçalho esperado do changelog: ${CHANGELOG_HEADER.trim()}`);
      process.exit(command ? 1 : 0);
    }
  }
}

main();
