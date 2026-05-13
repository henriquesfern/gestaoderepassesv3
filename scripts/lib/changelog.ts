import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const CHANGELOG_PATH = resolve(process.cwd(), 'CHANGELOG_PENDING.md');
export const CHANGELOG_HEADER = '# Alterações Pendentes de Sincronismo (GitHub)\n';

export function ensureChangelogFile() {
  if (!existsSync(CHANGELOG_PATH)) {
    writeFileSync(CHANGELOG_PATH, CHANGELOG_HEADER, 'utf8');
  }
}

export function readChangelog() {
  ensureChangelogFile();
  return readFileSync(CHANGELOG_PATH, 'utf8');
}

export function writeChangelog(content: string) {
  mkdirSync(dirname(CHANGELOG_PATH), { recursive: true });
  writeFileSync(CHANGELOG_PATH, content.replace(/\r\n/g, '\n'), 'utf8');
}

export function resetChangelog() {
  writeChangelog(CHANGELOG_HEADER);
}

export function hasPendingEntries() {
  return readChangelog().trim() !== CHANGELOG_HEADER.trim();
}

export function appendEntry(title: string, items: string[]) {
  const base = readChangelog().trimEnd();
  const now = new Date();
  const timestamp = now.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const formattedItems = items.map((item) => `  - ${item.trim()}`).join('\n');
  const block = [
    '',
    `## Registro automático - ${timestamp}`,
    '',
    `- **${title.trim()}**:`,
    formattedItems,
    '',
  ].join('\n');

  writeChangelog(`${base}${block}`);
}

export function getChangelogBody() {
  const content = readChangelog();
  return content.replace(CHANGELOG_HEADER, '').trim();
}
