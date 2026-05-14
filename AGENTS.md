# Diretrizes de Comunicação e Desenvolvimento

- **Idioma**: Todas as comunicações, resumos de alterações, comentários de código novos e metadados de sincronização DEVEM ser escritos em **Português do Brasil (pt-BR)**.
- **Contexto**: Este projeto é um dashboard de monitoramento de fomento e infraestrutura voltado para o cenário brasileiro.
- **Registro contínuo de alterações**: Imediatamente após realizar qualquer alteração construtiva no código, o agente DEVE documentar a mudança no arquivo `CHANGELOG_PENDING.md`.
- **Sincronismo com GitHub**: Ao realizar exportação ou sincronismo com o GitHub, o assistente e a ferramenta de integração DEVEM usar o conteúdo de `CHANGELOG_PENDING.md` para gerar descrições completas de commit e PR, sempre em pt-BR.

## Automação Operacional Obrigatória

Para reduzir trabalho manual e manter o fluxo consistente, o agente DEVE usar os scripts operacionais abaixo:

- `npm run changelog:add -- --title "..." --item "..."`: registra uma entrega nova no `CHANGELOG_PENDING.md`
- `npm run changelog:status`: mostra se o changelog tem pendências
- `npm run changelog:reset`: zera o `CHANGELOG_PENDING.md`, mantendo apenas o cabeçalho
- `npm run flow:status`: mostra o estado do branch, do changelog e do workspace Git
- `npm run flow:prepare-pr`: valida o branch atual, executa `build` e `lint` e gera um rascunho de PR em `.tmp/pr-body.md`
- `npm run flow:finalize-main`: reseta o changelog no pós-merge quando o trabalho já foi sincronizado

### Regras de uso da automação

- Depois de cada alteração construtiva, registrar a mudança com `changelog:add`.
- Antes de abrir PR, executar `flow:prepare-pr`.
- Depois de concluir merge na `main`, executar `flow:finalize-main`.
- O arquivo `CHANGELOG_PENDING.md` só deve permanecer com conteúdo enquanto existirem entregas ainda não sincronizadas.

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
