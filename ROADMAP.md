# Roadmap de Desenvolvimento

Este documento centraliza o planejamento detalhado, as ações propostas e o histórico de execuções futuras, garantindo que o contexto não se perca durante recarregamentos de sessão do assistente.

## Estado Atual
- **Ação A:** Concluída (Centralização de Tipos/Interfaces).
- **Ação B:** Concluída (Refatoração do Parser - Separation of Concerns).
- **Ação C:** Concluída (Fragmentação de Monolitos de Interface e Separação de Regras).

## Planejamento e Execução

A sequencia estabelecida para as próximas ações é:
- **Ação D:** Concluída (Fragmentação dos Monolitos de Tabelas).
- **Ação E:** Pendente (Refatoração de Insights - InfraBRInsights.tsx).
- **Ação F:** Pendente (Evolução em UX/UI nas Visualizações e Acessibilidade).
- **Ação G:** Pendente (Refatoração Dinâmica com Contexto Global).

## Análise de Manutenções Críticas (Novas Evoluções Tecnológicas e UX/UI)

Após o sucesso do nosso fluxo refatorativo (A, B e C), o código ficou mais seguro de intervir. Realizei uma nova varredura e constatei que ainda possuímos excelentes pontos de melhoria, seja na arquitetura UI ou na parte técnica. Seguem os passos propostos:

- **Ação D (Protocolo Nível 2): Fragmentação dos Monolitos de Tabelas (Directory.tsx e DirectoryECGeral.tsx)**
  - O componente de Diretório concentra ainda ~650 linhas atreladas à UI da tabela nativa e à lógica combinada de filtros (map, reduce, states).
  - *Sugestão*: Isolar a lógica de ordenação e paginação/filtros em um hook `useDirectoryFilters.ts` e componentizar cabeçalhos e linhas (ex: `DirectoryRow.tsx`, `DirectoryFilters.tsx`) dentro de `src/components/directory/`.
  
- **Ação E (Protocolo Nível 2): Refatoração de Insights (InfraBRInsights.tsx)**
  - Com ~520 linhas, este painel renderiza gráficos avançados (`recharts`: Scatter e Bar) junto aos seletores de estado e agrupamento Infra-BR. 
  - *Sugestão*: Separar as regras matemáticas em `useInfraBRMetrics.ts` e exportar subcomponentes (`ScatterView.tsx`, `BarView.tsx`) para o diretório `src/components/infrabr/`.
  
- **Ação F (Protocolo Nível 1): Evolução em UX/UI nas Visualizações e Acessibilidade**
  - Melhorias passivas e visuais: Aplicar `sticky header` e controles flutuantes mais evidentes nas tabelas extensas. Utilizar motion/transitions suaves para animações de linha expandida nas tabelas longas (usando a lib `motion` instalada) e ajustes de contraste aprimorados.
  
- **Ação G (Protocolo Nível 3): Refatoração Dinâmica com Contexto Global (Opcional - Arquitetura de Dados)**
  - Atualmente, as massas de dados parciais são todas resolvidas nativamente nos primeiros imports (em `src/data/parser.ts`), subindo para a memória virtual do browser logo no boot. 
  - *Sugestão*: Transição para uma camada leve de *React Context* (`DataContext.tsx`) onde os hooks farão o acesso global. *Por ser Nível 3, precisará de planejamento cuidadoso.*
