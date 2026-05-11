# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
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
- **Ação H implementada (Protocolo Nível 1 - Ajuste de Lógica e Tooltip):**
  - Ajuste na contagem de "Total de Dimensões Atingidas" no mapa geográfico, passando a calcular estritamente os valores únicos (distintos) de dimensões de cada estado. As validações contam com normalização de string avançada (`src/hooks/useOverviewMetrics.ts`) e o Tooltip em `OverviewMap.tsx` agora reflete a totalização correta (ex: estado do Pará passando a apontar 3 dimensões exclusivas alcançadas, em vez da simples soma das entidades).
