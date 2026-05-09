# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- Sincronismo com GitHub efetuado e log de alterações reiniciado.
- **Ação A implementada (Protocolo Nível 2 - Tipagens)**: Centralização global de Tipos e Interfaces do sistema. Foi criado o diretório estrutural `src/types/` agregando os contratos dispersos no `parser.ts` (`EntidadeSelecionada`, `EntidadeCDEN`, etc) e `infraBR_types.ts`, isolando a camada de domínio dos arquivos de dados, limpando dependências cruzadas e mitigando quebras circulares no Typescript. Build rodado e validado garantindo segurança total da UI.
- **Ação B implementada (Protocolo Nível 2 - Separação do Parser)**: Refatoração da lógica do parser de dados (`src/data/parser.ts`) implementando o padrão de *Separation of Concerns* (Separação de Responsabilidades).
  - Isolamento dos utilitários de limpeza e conversão de formato de números em `src/utils/formatters.ts`.
  - Separação dos adaptadores de transformação da infraestrutura e regras de negócio para as diferentes tipologias de arquivos CSV da base de dados (`adaptFomento2025`, `adaptFomento2026`, `adaptPatrocinio2025`) para `src/data/adapters.ts`.
  - Redução do `parser.ts` primário para atuar estritamente como ponte orquestradora da etapa de parse do Papaparse, resultando em um código modular, mais limpo e legível. Build executado com sucesso.
- **Ação C implementada (Protocolo Nível 2 - Fragmentação de Monolitos)**: Modularização do monolito de interface `Overview.tsx` utilizando o princípio de Separation of Concerns e Clean Code.
  - Extração de toda a complexidade computacional (métrica de KPIs, distribuição geográfica, filtros dimensionais e agregações complexas da matriz Infra-BR e Fomento) para um novo custom react hook, construído em `/src/hooks/useOverviewMetrics.ts`.
  - Desmembramento da camada UI (Interface) original (~1100 linhas) em subcomponentes menores, concisos e fáceis de colaborar, alocados na nova estrutura de diretório `/src/components/overview/` (`OverviewKPIs.tsx`, `OverviewHistoryChart.tsx`, `OverviewMap.tsx`, `OverviewDistributionChart.tsx`, `OverviewInfraBRPanel.tsx` e `OverviewUtils.tsx`).
  - O componente primário `Overview.tsx` manteve apenas a atribuição de *container/orchestrator*, controlando a injeção de dependências visuais, sem regras fortes.
  - Totalmente testado com sucesso pelo *Vite JS/Rollup*.
- **Ação D implementada (Protocolo Nível 2 - Fragmentação dos Monolitos de Tabelas)**: Extração da lógica UI/negócios dos monolitos massivos `Directory.tsx` e `DirectoryECGeral.tsx`.
  - Foram criados os *custom hooks* `useDirectory.ts` e `useDirectoryECGeral.ts`, isolando completamente os longos processos de ordenação, paginação global, contagem indexada de Entidades e controle múltiplo de filtros dimensionais.
  - Fragmentação do painel modular de controles e tabelas da matriz UI em componentes atômicos dentro de `src/components/directory/`, extraindo a formatação e as renderizações aninhadas para `DirectoryFilters.tsx`, `DirectoryRow.tsx`, além das suas derivações parciais no EC Geral (`DirectoryECGeralFilters.tsx` e `DirectoryECGeralRow.tsx`) e utilitários visuais unificados (`DirectoryUtils.tsx` e `InfraBRProgressBar.tsx`).
  - Atualização do `ROADMAP.md` e testado em Build limpo com sucesso.
- **Ação E implementada (Protocolo Nível 2 - Refatoração de Insights)**: Evolução do monolito `InfraBRInsights.tsx`.
  - Criação do *custom hook* `useInfraBRMetrics.ts` com a lógica de cruzamento de repasses, formatação cartográfica, quadrantes de correlação e radares, liberando a interface.
  - Divisão das visualizações complexas em componentes atômicos: `InfraBRScatterView.tsx` (Relação e Matriz de Quadrantes), `InfraBRMapView.tsx` (Mapa Geográfico) e `InfraBRStateDetails.tsx` (Radares e Componentes Detalhados).
  - Componente central (`InfraBRInsights.tsx`) funcionando apenas como orquestrador estrutural. Testado no build com sucesso.
- **Ação F implementada (Protocolo Nível 1 - UX/UI e Acessibilidade)**:
  - Criação de componente `FloatingControls.tsx` para apresentar um botão flutuante de "Voltar ao topo" evidenciado nas longas listagens.
  - Fixação (`sticky`) do header com `shadow-md` nas tabelas `Directory.tsx` e `DirectoryECGeral.tsx` para não perder contexto vertical durante o scroll do usuário.
  - Animações via Framer Motion já garantidas com `motion/react` durante a expansão/detalhamento nas listagens do Diretório.
- **Ação G implementada (Protocolo Nível 2 - Refactoring Data Loading):** 
  - Criação de um Global Data Context (`src/context/DataContext.tsx`) para processar e fornecer as informações estáticas na inicialização da aplicação usando a API de Contexto do React com estado de *loading*.
  - Remoção de variáveis exportadas globalmente do `src/data/parser.ts` em favor do hook provido por `useData()`, melhorando a previsibilidade da inicialização no ambiente web.
  - Adaptados todos os componentes agregadores no topo e utilitários (`App.tsx`, `AIAssistant.tsx`, `Directory.tsx`, `FiscalView.tsx`, `Overview.tsx`, `GlobalDirectory.tsx`, `InsightsECGeral.tsx`, `GlobalEntitiesOverview.tsx`, `InsightsView.tsx`, `StateForceView.tsx`, `FinancialPanel.tsx`, `useOverviewMetrics.ts`, `useDirectoryECGeral.ts`, `useInfraBRMetrics.ts` e o arquivo `main.tsx`) para consumir adequadamente a árvore de dados via React Provider. Modificado o script isolado `scripts/validateData.ts` para carregar localmente sem estado de UI.
  - Aplicação executada com tipagens em nível de build perfeitamente concluídas.
