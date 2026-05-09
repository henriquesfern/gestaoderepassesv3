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
