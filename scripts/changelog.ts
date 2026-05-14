import { appendEntry, CHANGELOG_PATH, getChangelogBody, hasPendingEntries, readChangelog, resetChangelog } from './lib/changelog.js';

function readFlagValues(flag: string, args: string[]) {
  const values: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === flag) {
      const value = args[i + 1];
      if (value) {
        values.push(value);
        i += 1;
      }
    }
  }

  return values;
}

function requireSingleFlag(flag: string, args: string[]) {
  const values = readFlagValues(flag, args);
  if (values.length === 0) {
    throw new Error(`Informe ${flag} "valor".`);
  }
  return values[0];
}

function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'status': {
      const pending = hasPendingEntries();
      console.log(`Arquivo: ${CHANGELOG_PATH}`);
      console.log(`Possui pendências: ${pending ? 'sim' : 'não'}`);
      if (pending) {
        console.log('\nConteúdo atual:\n');
        console.log(readChangelog());
      }
      break;
    }
    case 'reset': {
      resetChangelog();
      console.log('CHANGELOG_PENDING.md local zerado com sucesso.');
      break;
    }
    case 'add': {
      const title = requireSingleFlag('--title', args);
      const items = readFlagValues('--item', args);

      if (items.length === 0) {
        throw new Error('Informe ao menos um --item "descrição".');
      }

      appendEntry(title, items);
      console.log('Entrada adicionada ao CHANGELOG_PENDING.md local.');
      break;
    }
    case 'body': {
      const body = getChangelogBody();
      console.log(body || 'Nenhuma pendência registrada.');
      break;
    }
    default: {
      console.log('Uso:');
      console.log('  npm run changelog:status');
      console.log('  npm run changelog:reset');
      console.log('  npm run changelog:add -- --title "Título" --item "Item 1" --item "Item 2"');
      process.exit(command ? 1 : 0);
    }
  }
}

main();
