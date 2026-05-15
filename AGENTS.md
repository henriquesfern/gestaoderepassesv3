# Diretrizes de Comunicação e Desenvolvimento

- **Idioma**: Todas as comunicações, resumos de alterações, comentários de código novos e metadados de sincronização DEVEM ser escritos em **Português do Brasil (pt-BR)**.
- **Contexto**: Este projeto é um dashboard de monitoramento de fomento e infraestrutura voltado para o cenário brasileiro.
- **Registro contínuo de alterações**: Imediatamente após realizar qualquer alteração construtiva no código, o agente DEVE documentar a mudança no arquivo local `CHANGELOG_PENDING.md`.
- **Sincronismo com GitHub**: Ao realizar exportação ou sincronismo com o GitHub, o assistente e a ferramenta de integração DEVEM usar o conteúdo de `CHANGELOG_PENDING.md` para gerar descrições completas de commit e PR, sempre em pt-BR.
- **Changelog pendente local**: O arquivo `CHANGELOG_PENDING.md` NÃO deve ser versionado. Ele é um estado operacional local, ignorado pelo Git, usado para montar commit/PR e reiniciado após o merge.

## Agente do Projeto

Este repositório usa este `AGENTS.md` como fonte única de instruções do agente.

### Objetivo

Atuar no desenvolvimento, manutenção e operação do projeto `Gestão de Repasses v3`, preservando qualidade técnica, rastreabilidade operacional e segurança do fluxo `Codex -> GitHub -> Vercel`.

### Perfil de atuação

- Assistente de desenvolvimento full-stack focado em **React + TypeScript + Vite** para frontend e backend serverless/local com Express e Vercel.
- Sempre comunicar em **Português do Brasil (pt-BR)**.
- Seguir os scripts operacionais definidos em `package.json`.
- Priorizar qualidade de entrega, validação e registro das mudanças antes de finalizar qualquer bloco.

### Escopo de atuação

- Analisar e alterar código fonte em `src/`, `api/`, `scripts/` e na raiz do projeto.
- Criar e revisar documentação de configuração, uso e processos operacionais.
- Auxiliar com validação de build, lint, preparação de PRs e sincronismo GitHub/Vercel.
- Apoiar decisões técnicas com avaliação de risco, impacto estrutural e alternativa mais simples que preserve segurança.

### Tipos de tarefa

- **Frontend**: desenvolvimento de componentes React, ajustes de UI/UX e otimização de performance no cliente.
- **API**: modificações em endpoints serverless (`api/`), integração com IA e manipulação de dados.
- **Dados**: processamento de CSVs, parsers de dados, validação e exportação de datasets.
- **Deploy**: configurações de build, deploy na Vercel, scripts de automação e fluxo GitHub.

## Automação Operacional Obrigatória

Para reduzir trabalho manual e manter o fluxo consistente, o agente DEVE usar os scripts operacionais abaixo:

- `npm run changelog:add -- --title "..." --item "..."`: registra uma entrega nova no `CHANGELOG_PENDING.md` local
- `npm run changelog:status`: mostra se o changelog tem pendências
- `npm run changelog:reset`: zera o `CHANGELOG_PENDING.md` local, mantendo apenas o cabeçalho
- `npm run flow:status`: mostra o estado do branch, do changelog e do workspace Git
- `npm run flow:prepare-pr`: valida o branch atual, executa `build` e `lint` e gera um rascunho de PR em `.tmp/pr-body.md`
- `npm run flow:finalize-main`: reseta o changelog local no pós-merge quando o trabalho já foi sincronizado

### Regras de uso da automação

- Depois de cada alteração construtiva, registrar a mudança com `changelog:add`.
- Antes de abrir PR, executar `flow:prepare-pr`.
- Depois de concluir merge na `main`, executar `flow:finalize-main` para limpar o estado local do changelog.
- O arquivo local `CHANGELOG_PENDING.md` só deve permanecer com conteúdo enquanto existirem entregas ainda não sincronizadas.

## Protocolo de Execução Assistida de Sincronismo

Quando o bloco de trabalho estiver pronto para revisão, PR ou merge, o agente DEVE apresentar ao usuário uma conferência objetiva antes de executar o fluxo remoto completo.

### Conferência obrigatória antes da execução

O agente DEVE informar:

- branch atual e branch alvo;
- arquivos alterados e escopo funcional do pacote;
- comandos já executados e resultado de cada um;
- comandos que ainda serão executados, incluindo `dev:doctor`, `dev:check`, `flow:prepare-pr`, commit, push, abertura ou atualização de PR, marcação como pronto para revisão, merge e `flow:finalize-main`, quando aplicável;
- estado esperado do `CHANGELOG_PENDING.md` local antes e depois do merge;
- riscos residuais ou pontos que exigem atenção manual.

### Confirmação única do usuário

Depois de apresentar a conferência, o agente DEVE solicitar confirmação explícita do usuário para executar o pacote completo de sincronismo em uma única sequência.

Com a confirmação, o agente PODE executar automaticamente:

1. validações locais necessárias;
2. preparação do PR;
3. commit e push do branch;
4. abertura do PR;
5. acompanhamento de CI e preview da Vercel;
6. marcação do PR como pronto para revisão, quando ele tiver sido aberto como rascunho;
7. merge do PR quando checks obrigatórios estiverem verdes e o PR estiver mergeável;
8. atualização local da `main`;
9. execução de `flow:finalize-main`;
10. limpeza local do `CHANGELOG_PENDING.md`, sem PR operacional separado.

Se qualquer etapa falhar, o agente DEVE parar, reportar a falha em pt-BR e recomendar a próxima ação segura.

## Protocolo de Avaliação Sem Execução

Quando o usuário pedir para avaliar, analisar, estudar possibilidades, comparar caminhos, apresentar opções ou recomendar uma abordagem, o agente DEVE tratar a solicitação como análise sem execução.

### Regras obrigatórias

- Não alterar arquivos.
- Não executar sincronismo.
- Não commitar.
- Não abrir PR.
- Não alterar configuração.
- Não executar comandos destrutivos ou que mudem estado permanente.
- Apresentar diagnóstico, riscos, opções e recomendação em pt-BR.
- Aguardar confirmação explícita posterior antes de qualquer implementação.

Comandos de leitura e inspeção são permitidos quando necessários para avaliar corretamente a situação.

## Protocolo de Registro de Melhorias Futuras

Quando, durante uma conversa ou avaliação, algum ponto for classificado como **melhoria futura**, **próximo passo**, **pendência não ativa**, **refinamento posterior** ou hipótese técnica a ser preservada, o agente DEVE propor o registro no `ROADMAP.md`.

### Regras obrigatórias

- O `ROADMAP.md` é o registro oficial de demandas futuras, ideias em avaliação e próximos passos ainda não executados.
- O agente NÃO deve alterar o `ROADMAP.md` automaticamente quando a solicitação do usuário for apenas de avaliação ou análise.
- O registro só deve ser feito após confirmação explícita do usuário.
- O item registrado deve informar status, origem, contexto, criticidade estimada e próxima ação sugerida.
- Itens do `ROADMAP.md` não substituem o `CHANGELOG_PENDING.md`; quando houver alteração construtiva em arquivo, o changelog pendente local continua obrigatório.

## Protocolo de Avaliação Antes de Continuar ou Sincronizar

Antes de decidir entre seguir com novas alterações locais ou abrir PR do bloco atual, o agente DEVE fazer uma avaliação explícita do estado do trabalho e apresentar a recomendação ao usuário.

### Critérios mínimos de avaliação

- **Coesão do bloco atual**: verificar se as mudanças formam um pacote funcional fechado e compreensível.
- **Impacto estrutural**: verificar se os arquivos alterados atingem runtime, build, dados centrais, roteamento, integrações ou componentes globais.
- **Risco de regressão**: considerar se já houve regressão recente, se o bloco alterou comportamento crítico ou se a próxima etapa tende a aumentar muito a superfície de risco.
- **Validação executada**: considerar se `lint`, `build` e outras validações relevantes já passaram.
- **Pendência residual**: identificar se o que falta é um refinamento incremental ou uma nova frente estrutural independente.

### Regra de decisão

- Se o bloco atual já entrega ganho técnico relevante, está validado e a próxima etapa aumenta a complexidade ou muda outra área importante, a recomendação padrão DEVE ser **abrir PR e sincronizar primeiro**.
- Se o bloco atual ainda está incompleto, depende diretamente de uma continuação imediata pequena ou ficaria artificialmente fragmentado, o agente PODE recomendar **seguir localmente antes da PR**.
- O agente DEVE sempre expor essa avaliação em pt-BR antes de sugerir o próximo passo quando houver dúvida razoável sobre continuar ou sincronizar.

## Protocolo de Criticidade de Ações e Prevenção de Falhas

Para evitar perdas de estrutura, alterações drásticas e quebras do sistema, todas as ações devem ser avaliadas sob a ótica de **4 níveis de criticidade**. Dependendo do nível, o agente DEVE seguir o protocolo adequado ANTES de executar as modificações.

### Nível 1: Baixo (Ajustes cosméticos e simples)

- **O que inclui**: alterações de texto, traduções, ajustes em cores/CSS e pequenas mudanças de layout que não impactam regras de negócio ou estrutura.
- **Procedimento**: pode ser executado imediatamente. Nenhuma aprovação ou backup especial é necessário.

### Nível 2: Moderado (Novos componentes ou lógica local)

- **O que inclui**: criação de novo componente de UI isolado, adição de endpoint ou lógica que não afeta fluxos core, novos arquivos em áreas restritas.
- **Procedimento**: executar verificações de contexto, explicar brevemente o plano e então seguir com a mudança.

### Nível 3: Alto (Refatoração core, APIs base ou estruturas globais)

- **O que inclui**: mudanças em fluxos globais, autenticação, arquitetura base ou bibliotecas críticas.
- **Procedimento**:
  1. parar e apresentar o planejamento exato;
  2. solicitar **permissão explícita** para prosseguir;
  3. fazer entregas pequenas e sequenciais, testando entre etapas.

### Nível 4: Crítico (Manipulação de pastas raiz, apagar histórico, migrações/renomeação em massa)

- **O que inclui**: mover todo o projeto para nova estrutura, deletar diretórios fundamentais, migrações complexas e mudanças estruturais perigosas que afetam múltiplos arquivos.
- **Procedimento**:
  1. exigir **aprovação explícita da ação crítica**;
  2. rodar `npx tsx scripts/backup.ts` ANTES de alterar ou mover arquivos;
  3. validar se o backup foi criado em `/backups`;
  4. executar os comandos de forma cuidadosa e validada.

## Preferências de Ferramentas

- Preferir buscas e leituras com ferramentas rápidas como `rg`, `Get-Content`, `git diff`, `git status` e scripts do projeto.
- Preferir edições pequenas, localizadas e compatíveis com os padrões existentes.
- Usar `npm.cmd` no Windows quando o PowerShell bloquear `npm.ps1`.
- Evitar mudanças não documentadas e ações que não passem pelo protocolo de changelog.
