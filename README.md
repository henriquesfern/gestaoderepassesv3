<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gestão de Repasses v3

Dashboard de monitoramento de fomento e infraestrutura com foco no cenário brasileiro.

## Stack atual

- Frontend: `Vite + React + TypeScript`
- Backend de IA em deploy: `api/ai.ts` como função serverless na Vercel
- Runtime local legado: `server.ts` com `tsx`
- Deploy: `GitHub -> Vercel`

## Fluxo operacional oficial

O modelo adotado para a evolução do projeto é `Codex -> GitHub -> Vercel`.

- `main`: tronco central e branch oficial de produção
- `producao`: branch legada congelada, sem novas evoluções diretas
- previews: gerados a partir de branches e pull requests
- production: apontando para `main` na Vercel

Estado consolidado em **13 de maio de 2026**:

- a produção da Vercel foi promovida com sucesso a partir da `main`
- a `main` passa a ser a única trilha oficial de evolução com publicação em produção
- a `producao` deve ser mantida apenas como referência legada e histórico de transição

Mais detalhes em [docs/operacao/fluxo-release.md](docs/operacao/fluxo-release.md) e [docs/operacao/checklist-protecao-main.md](docs/operacao/checklist-protecao-main.md).

## Execução local

Pré-requisitos:

- Node.js 20 ou superior
- trabalhar na pasta local do repositório Git: [gestaoderepassesv3-git](C:/Users/fernando.henriques/Downloads/github/gestaoderepassesv3-git)

Fluxos principais:

```bash
npm install
npm run dev:doctor
npm run dev:ui
```

Quando precisar validar o comportamento da Vercel e da IA localmente:

```bash
npm run dev:env:pull
npm run dev:vercel
```

Preview local do build:

```bash
npm run dev:preview
```

Checagem antes de PR:

```bash
npm run dev:check
```

Guia detalhado:

- [docs/operacao/ambiente-local-vscode.md](docs/operacao/ambiente-local-vscode.md)

## Variáveis de ambiente

Crie um arquivo `.env.local` quando necessário e configure:

- `GEMINI_API_KEY`: chave usada pela funcionalidade de IA

## Observações importantes

- O deploy Vercel usa `vercel.json` com build Vite e saída em `dist`.
- Para ajustes visuais rápidos, prefira `npm run dev:ui`.
- Para testar IA e funções da Vercel localmente, prefira `npm run dev:vercel`.
- O arquivo local `CHANGELOG_PENDING.md` deve ser atualizado sempre que houver alterações construtivas; ele é usado para montar PRs e não entra em versionamento.
- A branch `producao` não deve mais ser usada como destino de release ou de desenvolvimento.
