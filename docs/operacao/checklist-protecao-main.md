# Checklist de Proteção da `main`

Este checklist consolida a configuração recomendada para a branch `main` no GitHub após a migração do fluxo de produção.

## Regra de proteção da `main`

Criar uma branch protection rule para `main` com:

- `Require a pull request before merging`
- `Require approvals`: mínimo de 1 aprovação
- `Dismiss stale pull request approvals when new commits are pushed`
- `Require approval of the most recent reviewable push`, se a opção estiver disponível
- `Require status checks to pass before merging`
- `Require branches to be up to date before merging`
- status checks obrigatórios:
  - `qualidade`
- `Require conversation resolution before merging`
- `Require review from Code Owners`
- `Do not allow bypassing the above settings`, se o repositório permitir
- desabilitar force push
- desabilitar deletion da branch

## Restrição operacional para `producao`

Criar uma branch protection rule específica para `producao` com uma das abordagens abaixo:

- preferencial: `Lock branch`
- alternativa: exigir PR e restringir pushes apenas a administradores, sem uso operacional da branch

## Itens complementares no repositório

- manter `.github/CODEOWNERS` apontando para `@henriquesfern`
- manter a CI com job único `qualidade` para evitar ambiguidade em required checks
- manter o `CHANGELOG_PENDING.md` atualizado em toda entrega

## Referências

- GitHub Docs: gerenciamento de branch protection rules
- GitHub Docs: protected branches e required status checks
