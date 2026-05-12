# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- **Ação Q implementada (Protocolo Nível 1 - Refinamento Visual da Barra de Progresso)**:
  - Ajuste na renderização da barra de progresso: o degradê agora é fixo no recipiente (representando o período total) e o preenchimento revela a cor correspondente à data atual, melhorando a precisão visual do avanço temporal.
- **Ação R implementada (Protocolo Nível 1 - Ajuste de Lógica de KPIs)**:
  - Ajuste na lógica de cálculo de "Total de Dimensões Atingidas" e "Percentual de Aderência" no Painel de Overview para apresentar o alcance real das dimensões do Infra-BR (dimensões únicas atingidas / 6), corrigindo a percepção de aderência tanto no cenário nacional quanto sob filtro estadual.
  - Ajuste nos labels do tooltip no Painel de Overview, removendo a referência a "média" para apresentar "Percentual de aderência" direto, refletindo a nova lógica de cálculo.
