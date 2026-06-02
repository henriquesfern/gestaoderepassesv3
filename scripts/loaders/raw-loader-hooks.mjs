/**
 * Hooks ESM para suporte a imports com sufixo ?raw (sintaxe Vite) em Node.js.
 * Executado no worker de hooks do Node.js via module.register() em raw-loader.mjs.
 */

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('?raw')) {
    const cleanSpecifier = specifier.slice(0, -4);
    const resolved = await nextResolve(cleanSpecifier, context);
    return {
      url: resolved.url + '?raw',
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('?raw')) {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const filePath = fileURLToPath(url.slice(0, -4));
    const content = readFileSync(filePath, 'utf-8');
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(content)};`,
    };
  }
  return nextLoad(url, context);
}
