# Ambiente Local no VS Code

Este guia define o fluxo local recomendado para desenvolver, visualizar e testar o projeto **antes** de abrir commit, push, PR e preview da Vercel.

## Pasta correta

Trabalhe sempre na pasta:

- [gestaoderepassesv3-git](C:/Users/fernando.henriques/Downloads/github/gestaoderepassesv3-git)

Essa é a cópia com `.git`, histórico local, branches e vínculo com GitHub/Vercel.

## Pré-requisitos

Você precisa ter:

- `Node.js 20` ou superior
- dependências instaladas com `npm install`
- VS Code já instalado

Para testar a IA e o runtime próximo da produção, também é recomendável ter:

- Vercel CLI disponível via `npx vercel`
- `.env.local` configurado

## Diagnóstico rápido

Antes de começar, rode:

```bash
npm run dev:doctor
```

Esse comando verifica:

- versão do Node.js
- presença de `node_modules`
- presença de `.env.local`
- vínculo local com a Vercel
- disponibilidade da Vercel CLI

## Modos de trabalho local

### 1. UI rápida

Use quando quiser testar:

- layout
- cores
- tipografia
- espaçamento
- responsividade
- microajustes de componentes

Comando:

```bash
npm run dev:ui
```

Observação:

- esse modo usa o `server.ts`
- ele é o modo mais rápido para alterações visuais
- ele não é o modo mais fiel para testar a API da Vercel

### 2. Simulação local da Vercel

Use quando quiser testar:

- `/api/ai`
- comportamento de funções serverless
- variáveis de ambiente da Vercel
- validação mais próxima do deploy real

Comando:

```bash
npm run dev:vercel
```

Se precisar atualizar as variáveis locais da Vercel, rode:

```bash
npm run dev:env:pull
```

### 3. Preview local do build

Use quando quiser validar o build gerado para produção, sem fazer deploy.

Comando:

```bash
npm run dev:preview
```

Esse fluxo:

- roda o build
- sobe o preview local do conteúdo gerado em `dist`

### 4. Checagem antes de PR

Use antes de abrir PR, quando o ajuste local já estiver aprovado.

Comando:

```bash
npm run dev:check
```

Esse comando executa:

- `npm run lint`
- `npm run build`

## Fluxo recomendado do dia a dia

### Ajuste visual simples

1. abrir o projeto no VS Code
2. rodar `npm run dev:ui`
3. testar no navegador
4. ajustar até ficar bom
5. rodar `npm run dev:check`
6. só depois seguir para commit/PR

### Ajuste com impacto em IA ou API

1. abrir o projeto no VS Code
2. rodar `npm run dev:vercel`
3. testar a tela e a rota da IA localmente
4. ajustar até validar o comportamento
5. rodar `npm run dev:check`
6. só depois seguir para commit/PR

## Uso pelo VS Code sem decorar comandos

O projeto agora inclui tarefas em:

- [.vscode/tasks.json](C:/Users/fernando.henriques/Downloads/github/gestaoderepassesv3-git/.vscode/tasks.json)

No VS Code:

1. abra `Terminal`
2. clique em `Run Task`
3. escolha uma das tarefas:
   - `Projeto: diagnóstico local`
   - `Projeto: UI rápida local`
   - `Projeto: Vercel local`
   - `Projeto: puxar env da Vercel`
   - `Projeto: preview local do build`
   - `Projeto: validar antes de PR`

## Extensões recomendadas

O projeto também inclui recomendações em:

- [.vscode/extensions.json](C:/Users/fernando.henriques/Downloads/github/gestaoderepassesv3-git/.vscode/extensions.json)

Recomendações:

- ESLint
- Prettier
- Tailwind CSS IntelliSense

## Quando usar GitHub e Vercel

O fluxo remoto passa a ser usado **depois** do teste local.

Ordem recomendada:

1. testar localmente
2. validar com `npm run dev:check`
3. registrar as mudanças no `CHANGELOG_PENDING.md`
4. abrir commit/PR
5. validar preview da Vercel apenas como confirmação final

## Execução assistida do fluxo remoto

Quando o trabalho local estiver pronto para sincronismo, o agente deve apresentar uma conferência antes de executar o pacote remoto.

A conferência deve mostrar:

- branch atual e branch alvo;
- arquivos alterados;
- escopo do pacote;
- comandos já executados e resultado;
- comandos que ainda serão executados;
- estado esperado do `CHANGELOG_PENDING.md`;
- riscos residuais.

Depois dessa conferência, o agente deve pedir uma confirmação única para executar tudo de uma vez.

Com a confirmação, o fluxo pode incluir:

1. `npm run dev:doctor`;
2. `npm run dev:check`;
3. `npm run flow:prepare-pr`;
4. commit e push do branch;
5. abertura do PR;
6. acompanhamento de GitHub Actions e preview da Vercel;
7. marcação do PR como pronto para revisão;
8. merge do PR;
9. atualização local da `main`;
10. `npm run flow:finalize-main`;
11. PR operacional separado para limpar o `CHANGELOG_PENDING.md`, caso a proteção da `main` bloqueie push direto.

## Resumo prático

Se quiser a versão mais curta possível:

- ajuste visual: `npm run dev:ui`
- ajuste com IA/API: `npm run dev:vercel`
- checagem antes de PR: `npm run dev:check`
- diagnóstico do ambiente: `npm run dev:doctor`
