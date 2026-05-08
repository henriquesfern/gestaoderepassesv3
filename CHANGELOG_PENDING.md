# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- **Configuração de Agente**: Criação do arquivo `AGENTS.md` para reforçar a obrigatoriedade do uso do idioma Português do Brasil (pt-BR) nas comunicações, comentários e resumos de PR/Commit.
- **Nova regra em `AGENTS.md`**: Implementado padrão de registro contínuo de alterações através do arquivo `CHANGELOG_PENDING.md` para acúmulo de entregas entre sincronismos.
- **Componente Visual - Aderência**: Criação do componente `AdherenceProgressBar` para representar visualmente e em blocos de cores o preenchimento da Aderência Infra-BR (6 dimensões possíveis).
- **Lógica e Cálculo de Aderência**: Refatoração no bloco de KPIs (Total, Aderência e Porcentagem Média) refletindo dados precisos das dimensões cadastradas no conjunto de entidades renderizadas.
- **Inclusão de Tooltip Informativo**: Inserção de uma caixa de informação detalhada (tooltip de ajuda) na visualização de "Entidades Selecionadas" e no cabeçalho do Gráfico de "Investimento por Estado", exibindo os cálculos exatos base para as métricas da Média de Aderência Infra-BR. 
- **Tooltips no Mapa de Estados (`Overview.tsx`)**: Inclusão dos dados de Média de Dimensões e Percentual de Aderência em cada Unidade da Federação, injetados nativamente nos tooltips exibidos pelo "hover" no componente do mapa.
- **UX/UI**: Ajuste para garantir que a barra lateral e os cabeçalhos das áreas de análise de estado preservem a mesma formatação de altura/espaçamento e local de visualização da Aderência Infra-BR independentemente de haver filtro ativo ou não.
