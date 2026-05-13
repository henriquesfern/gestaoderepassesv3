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

Comandos principais:

```bash
npm install
npm run dev
```

Validações:

```bash
npm run build
npm run lint
```

## Variáveis de ambiente

Crie um arquivo `.env.local` quando necessário e configure:

- `GEMINI_API_KEY`: chave usada pela funcionalidade de IA

## Observações importantes

- O deploy Vercel usa `vercel.json` com build Vite e saída em `dist`.
- O runtime local ainda não replica integralmente as rotas serverless da Vercel; esse alinhamento faz parte da etapa técnica seguinte do saneamento.
- O arquivo `CHANGELOG_PENDING.md` deve ser atualizado sempre que houver alterações construtivas no repositório.
- A branch `producao` não deve mais ser usada como destino de release ou de desenvolvimento.
