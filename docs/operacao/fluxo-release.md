# Fluxo de Release e Branches

## Objetivo

Padronizar o projeto no modelo `Codex -> GitHub -> Vercel`, reduzindo divergência entre preview e production.

## Modelo-alvo

- `main`: única fonte de verdade do produto
- branches de trabalho: `codex/*`, `feat/*`, `fix/*`
- preview: aberto por branch e por pull request
- production: publicada somente a partir de `main`

## Estado consolidado

Em **13 de maio de 2026**, foi confirmado que:

- `main` e `producao` possuíam o mesmo conteúdo de arquivos
- a divergência entre elas era histórica, não funcional
- a produção da Vercel foi promovida com sucesso para `main`

## Regras operacionais a partir desta fase

- Nenhuma evolução nova deve nascer diretamente em `producao`.
- Toda entrega nova deve partir de `main` ou de branches derivadas de `main`.
- `producao` deve permanecer congelada como branch legada de referência.
- `producao` não deve receber commits funcionais, merges de release ou novas correções.
- Toda publicação em produção deve sair exclusivamente de `main`.

## Salvaguardas criadas

Antes do saneamento foram criadas as branches remotas:

- `backup/main-2026-05-13-fase3`
- `backup/producao-2026-05-13-fase3`

## Situação atual da produção

A `main` já está configurada como branch de produção na Vercel e um deploy de produção foi promovido com sucesso em **13 de maio de 2026**.

Com isso:

- `main` é a única fonte oficial de verdade para preview e production
- `producao` deve ser tratada apenas como legado congelado
- previews e validações devem ser feitos com base em PRs saindo de `main`
