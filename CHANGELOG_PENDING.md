# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- **Ação E implementada (Protocolo Nível 2 - Refatoração de Insights)**: Evolução do monolito `InfraBRInsights.tsx`.
- **Ação F implementada (Protocolo Nível 1 - UX/UI e Acessibilidade)**:
  - Criação de componente `FloatingControls.tsx`.
  - Fixação (`sticky`) do header.
  - Animações via Framer Motion.
- **Ação G implementada (Protocolo Nível 2 - Refactoring Data Loading):** 
  - Criação de um Global Data Context (`src/context/DataContext.tsx`).
- **Ação H implementada (Protocolo Nível 1 - Ajuste de Lógica e Tooltip):**
  - Ajuste na contagem de "Total de Dimensões Atingidas".
- **Ação I implementada (Protocolo Nível 1 - Ajuste de UI e Drill-down)**:
  - Adição de funcionalidade de drill-down.
- **Ação J implementada (Protocolo Nível 1 - Apresentação Visual do CNPJ)**:
  - Implementada formatação padrão de apresentação para todos os campos correspondentes a CNPJ.
- **Ação K implementada (Protocolo Nível 1 - Melhoria no Prompt da Inteligência Artificial)**:
  - Atualização do prompt de sistema do Gemini.
- **Ação L implementada (Protocolo Nível 1 - Refatoração de IA para frontend)**:
  - Migração de volta para o cliente Front-End.
- **Ação M implementada (Protocolo Nível 2 - Base Apartada e Preservada para Gerenciamento de Fomento 2026)**:
  - Criação do dataset `src/data/gestaofomento26.ts`.
- **Ação N implementada (Protocolo Nível 1 - Apresentação Dinâmica de Gestão para Fomento)**:
  - O carregador principal de contextos (`DataContext`/`parser`) foi modificado.
- **Ação 03 implementada (Protocolo Nível 1 - Ajuste de Layout na Visão do Fiscal)**:
  - Reestruturação do bloco de "Detalhes de Gestão" na tabela "Visão Detalhada por Fiscal" (`FiscalView.tsx`).
  - Implementação da funcionalidade de expandir/recolher (drill-down por projeto).
  - A funcionalidade agora responde ao clique em qualquer área da linha da entidade.
  - Adoção de um novo layout de grade.
  - Inclusão visual de uma barra de progresso de "Tempo Decorrido".
  - Ajuste fino do marcador (tamanho, cor, alinhamento).
- **Ação O implementada (Protocolo Nível 1 - Inclusão de Dados Fictícios de Gestão)**:
  - Inclusão de dados fictícios para os 5 primeiros registros.
- **Ação P implementada (Protocolo Nível 1 - Correção da Barra de Progresso)**:
  - Ajuste na lógica de parsing de datas na Visão Detalhada por Fiscal para suportar o formato 'yyyy-mm-dd'.
- **Ação Q implementada (Protocolo Nível 1 - Refinamento Visual da Barra de Progresso)**:
  - Ajuste na renderização da barra de progresso: o degradê agora é fixo no recipiente (representando o período total) e o preenchimento revela a cor correspondente à data atual, melhorando a precisão visual do avanço temporal.
