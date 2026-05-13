# Automação do Fluxo Codex -> GitHub -> Vercel

## Objetivo

Automatizar ao máximo o fluxo operacional do projeto sem depender de memória manual.

## Comandos disponíveis

### Changelog

- `npm run changelog:status`
  - mostra se o `CHANGELOG_PENDING.md` possui pendências

- `npm run changelog:add -- --title "Título" --item "Item 1" --item "Item 2"`
  - adiciona uma entrada estruturada ao changelog

- `npm run changelog:reset`
  - zera o arquivo e mantém apenas o cabeçalho `# Alterações Pendentes de Sincronismo (GitHub)`

### Fluxo operacional

- `npm run flow:status`
  - mostra branch atual, estado do workspace Git e se o changelog possui pendências

- `npm run flow:prepare-pr`
  - valida se o branch atual é um branch de trabalho
  - exige que o changelog tenha conteúdo
  - executa `npm run build`
  - executa `npm run lint`
  - gera um rascunho de corpo de PR em `.tmp/pr-body.md`

- `npm run flow:finalize-main`
  - deve ser executado na `main`
  - reinicia o `CHANGELOG_PENDING.md` após o sincronismo

- `npm run flow:finalize-main -- --commit`
  - reinicia o changelog e cria um commit automático de limpeza

## Fluxo recomendado

1. Criar branch a partir de `main`
2. Fazer alterações no código
3. Após cada bloco construtivo, registrar:

```bash
npm run changelog:add -- --title "Título do bloco" --item "Item 1" --item "Item 2"
```

4. Antes de abrir PR:

```bash
npm run flow:prepare-pr
```

5. Abrir PR para `main`, usando o conteúdo de `.tmp/pr-body.md` como base
6. Após merge na `main`:

```bash
npm run flow:finalize-main
```

## Observações

- A branch `producao` permanece congelada e não deve entrar no fluxo normal.
- O check obrigatório da `main` continua sendo `qualidade`.
- O conteúdo de `.tmp/` é temporário e não entra em versionamento.
