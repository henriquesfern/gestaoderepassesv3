# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra as modificações realizadas no projeto desde o último sincronismo. Ele deve ser usado para compor mensagens de commit e PR completas, sempre em Português do Brasil (pt-BR).

## Registro operacional mais recente

- **Preparação do saneamento do fluxo GitHub/Vercel (Protocolo Nível 3 - Governança de release)**:
  - Criadas as branches remotas de backup `backup/main-2026-05-13-fase3` e `backup/producao-2026-05-13-fase3` para rollback seguro antes da normalização de `main` e `producao`.
  - Preparado um clone Git válido do repositório para operação estrutural no modelo `Codex -> GitHub -> Vercel`.
  - Vinculado o clone operacional ao projeto real da Vercel `henriquesferns-projects/gestaoderepassesv3`, com download dos metadados locais e das variáveis de `preview`.

- **Formalização do novo fluxo de release no repositório (Protocolo Nível 3 - Governança e prevenção de drift)**:
  - Atualizado `README.md` para remover o fluxo legado do AI Studio e registrar o modelo operacional `Codex -> GitHub -> Vercel`.
  - Criado `docs/operacao/fluxo-release.md` com o modelo-alvo de branches, o estado de transição e a preparação do saneamento.
  - Criado `.github/PULL_REQUEST_TEMPLATE.md` com checklist de validação para build, lint, preview e atualização do changelog.
  - Criado `.github/workflows/ci.yml` para executar `npm ci`, `npm run build` e `npm run lint` no fluxo principal.
  - Adicionado o script `typecheck` ao `package.json` e padronizado `lint` para reutilizar essa validação no CI.
  - Mantida a exclusão de `.vercel` no versionamento via `.gitignore`, evitando ruído local de vínculo com a Vercel.

- **Cutover de produção e congelamento da `producao` (Protocolo Nível 3 - Governança pós-cutover)**:
  - Confirmada a promoção de produção da Vercel a partir da `main`, consolidando a `main` como branch oficial de produção.
  - Atualizado `README.md` para refletir a `main` como branch oficial de produção e a `producao` como branch legada congelada.
  - Atualizado `docs/operacao/fluxo-release.md` com o registro do cutover concluído da Vercel para `main`.
  - Ajustado `.github/workflows/ci.yml` para executar o fluxo de qualidade apenas em `main`, reforçando o congelamento operacional da `producao`.
  - Criado `.github/CODEOWNERS` apontando para `@henriquesfern` como base para revisão por code owner.
  - Criado `docs/operacao/checklist-protecao-main.md` com o checklist objetivo de branch protection para `main` e a estratégia recomendada de bloqueio da `producao`.

## Atualizações recentes

### Bloco sugerido para Commit 1 - Correção estrutural

- **Resolução de conflitos de merge na arquitetura do app (Protocolo Nível 3 - Estabilização estrutural)**:
  - Removidos marcadores de conflito aninhados de arquivos centrais da aplicação, incluindo `src/App.tsx`, `src/app/layout/*`, `src/app/navigation/tabs.ts` e `src/app/router/TabContent.tsx`.
  - Restauradas exportações limpas nos módulos de `src/features/*` e `src/shared/index.ts`, preservando a arquitetura por domínio já adotada pelo projeto.
  - Reorganizado `CHANGELOG_PENDING.md` para voltar a um estado consistente antes da validação completa do projeto.

### Bloco sugerido para Commit 2 - Ajuste funcional do chat

- **Ajuste no chat da IA (Protocolo Nível 1 - Correção de renderização textual)**:
  - Removido o parser matemático da resposta do assistente para evitar conflito entre Markdown e valores monetários no formato `R$`.
  - Aplicada normalização leve nas mensagens do modelo para recompor valores monetários quebrados, limpar caracteres invisíveis e reduzir fragmentação indevida de texto no histórico e nas novas respostas.
  - Ajustada a estratégia de quebra de linha do balão do chat para preservar melhor a leitura de palavras e cifras longas.

### Itens anteriores ainda pendentes

- **Ação Q implementada (Protocolo Nível 1 - Refinamento visual da barra de progresso)**:
  - Ajuste na renderização da barra de progresso: o degradê agora é fixo no recipiente, representando o período total, e o preenchimento revela a cor correspondente à data atual.

- **Ação R implementada (Protocolo Nível 1 - Ajuste de lógica de KPIs)**:
  - Ajuste na lógica de cálculo de "Total de Dimensões Atingidas" e "Percentual de Aderência" no painel de overview para apresentar o alcance real das dimensões do Infra-BR.
  - Ajuste nos labels do tooltip no painel de overview, removendo a referência a "média" para refletir a nova lógica de cálculo.

## 2026-05-12 - PR-01 (Fundação de Arquitetura)

- Refatorado `src/App.tsx` para atuar como orquestrador leve do layout, navegação e conteúdo.
- Criados módulos de navegação em `src/app/navigation/tabs.ts` com configuração de abas, separadores de seção e títulos de cabeçalho.
- Criado `src/app/layout/theme.ts` para centralizar o tema visual institucional.
- Criado `src/app/layout/Sidebar.tsx` para encapsular a sidebar e o comportamento de seleção de abas.
- Criado `src/app/router/TabContent.tsx` para concentrar o roteamento condicional das telas por aba, preservando o comportamento funcional existente.

## 2026-05-12 - PR-02 (Estrutura por Domínio/Feature - etapa inicial)

- Criadas entradas de domínio em `src/features/*/index.ts` para organizar o acesso às telas por contexto funcional.
- Criado `src/shared/index.ts` para consolidar exportações compartilhadas da camada de interface.
- Atualizado `src/app/router/TabContent.tsx` para consumir componentes por meio das novas fronteiras de `features`, preservando o comportamento atual.
- Atualizado `src/App.tsx` para consumir `FloatingControls` pela camada `shared`.

## 2026-05-12 - PR-03 (Pipeline de Dados em Camadas)

- Criados módulos de pipeline em `src/data/pipeline/` para separar responsabilidades de ingestão e transformação.
- Criado `buildAppData.ts` para consolidar a construção da fonte de dados da aplicação com `infraBR`.
- Mantido `src/data/parser.ts` como fachada pública estável, agora delegando a construção dos dados ao pipeline modular.
- Refatoração sem alteração de regra de negócio, com foco em organização e previsibilidade da camada de dados.

## 2026-05-12 - PR-04 (Tipagem forte dos Adapters)

- Criado `src/data/types.ts` com contratos tipados para as linhas brutas dos datasets.
- Refatorado `src/data/adapters.ts` para remover `any` das assinaturas e adotar tipos explícitos nas entradas e mapas auxiliares.
- Ajustado `src/data/parser.ts` para parse tipado dos datasets e construção de mapas com tipos fortes.
- Mantidas as regras de negócio existentes, com foco em previsibilidade e segurança de tipagem.

## 2026-05-12 - PR-05 (IA opcional com fallback seguro)

- Atualizado `src/services/aiService.ts` para operar com fallback amigável quando `GEMINI_API_KEY` não está configurada.
- Mantido o comportamento original da integração Gemini quando a chave está presente.
- Ajustada a mensagem de erro da interface da IA em `src/components/AIAssistant.tsx` para orientação mais clara ao usuário.
- Refatoração focada em operação `free-first` sem quebrar funcionalidades centrais do dashboard.

## 2026-05-12 - Correção IA segura (backend Vercel)

- Implementado o endpoint server-side `api/ai.ts` para consulta ao Gemini com chave protegida via `process.env.GEMINI_API_KEY`.
- Ajustado `AIAssistant` para consumir `/api/ai` em vez de executar consulta direta no frontend.
- Restabelecido o padrão seguro de segredo encapsulado no backend, evitando exposição de chave no bundle cliente.
