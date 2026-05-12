# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- **Ação Q implementada (Protocolo Nível 1 - Refinamento Visual da Barra de Progresso)**:
  - Ajuste na renderização da barra de progresso: o degradê agora é fixo no recipiente (representando o período total) e o preenchimento revela a cor correspondente à data atual, melhorando a precisão visual do avanço temporal.
- **Ação R implementada (Protocolo Nível 1 - Ajuste de Lógica de KPIs)**:
  - Ajuste na lógica de cálculo de "Total de Dimensões Atingidas" e "Percentual de Aderência" no Painel de Overview para apresentar o alcance real das dimensões do Infra-BR (dimensões únicas atingidas / 6), corrigindo a percepção de aderência tanto no cenário nacional quanto sob filtro estadual.
  - Ajuste nos labels do tooltip no Painel de Overview, removendo a referência a "média" para apresentar "Percentual de aderência" direto, refletindo a nova lógica de cálculo.

## 2026-05-12 - PR-01 (Fundação de Arquitetura)
- Refatorado `src/App.tsx` para atuar como orquestrador leve do layout, navegação e conteúdo.
- Criados módulos de navegação em `src/app/navigation/tabs.ts` com configuração de abas, separadores de seção e títulos de cabeçalho.
- Criado `src/app/layout/theme.ts` para centralizar o tema visual institucional.
- Criado `src/app/layout/Sidebar.tsx` para encapsular a sidebar e o comportamento de seleção de abas.
- Criado `src/app/router/TabContent.tsx` para concentrar o roteamento condicional das telas por aba, preservando o comportamento funcional existente.

## 2026-05-12 - PR-02 (Estrutura por Domínio/Feature - etapa inicial)
- Criadas entradas de domínio em `src/features/*/index.ts` para organizar o acesso às telas por contexto funcional (overview, directory, fiscal, financial, insights, infra e ai).
- Criado `src/shared/index.ts` para consolidar exportações compartilhadas da camada de interface.
- Atualizado `src/app/router/TabContent.tsx` para consumir componentes por meio das novas fronteiras de `features`, preservando o comportamento atual.
- Atualizado `src/App.tsx` para consumir `FloatingControls` pela camada `shared`.

## 2026-05-12 - PR-03 (Pipeline de Dados em Camadas)
- Criados módulos de pipeline em `src/data/pipeline/` para separar responsabilidades de ingestão (`ingest.ts`) e transformação (`transform.ts`).
- Criado `buildAppData.ts` para consolidar a construção da fonte de dados da aplicação com `infraBR`.
- Mantido `src/data/parser.ts` como fachada pública estável, agora delegando a construção dos dados ao pipeline modular.
- Refatoração sem alteração de regra de negócio, com foco em organização e previsibilidade da camada de dados.

## 2026-05-12 - PR-04 (Tipagem forte dos Adapters)
- Criado `src/data/types.ts` com contratos tipados para linhas brutas de Fomento 2025, Fomento 2026, Patrocínio 2025 e gestão de fomento.
- Refatorado `src/data/adapters.ts` para remover `any` das assinaturas e adotar tipos explícitos nas entradas e mapas auxiliares.
- Ajustado `src/data/parser.ts` para parse tipado dos datasets e construção de mapas com tipos fortes.
- Mantidas as regras de negócio existentes, com foco em previsibilidade e segurança de tipagem.