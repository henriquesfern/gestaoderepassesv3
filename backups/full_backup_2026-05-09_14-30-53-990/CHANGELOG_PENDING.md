# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- Sincronização prévia concluída e log de alterações reiniciado.
- **Normalização Defensiva e Consistência de Dados (Protocolo Nível 3)**:
  - Implementação efetiva da "Inserção Defensiva na Carga de Dados Iniciais" (Entrega D).
  - Atualização do motor de tradução e parse de planilhas (`src/data/parser.ts`) para aplicar de imediato os sanitizadores globais via `src/utils/sanitizers.ts`.
  - Extração limpa baseada na interceptação imediata após leitura do Papa Parse para arrays associativos (`cdenParsed`, `precursorasParsed`, `fomentoHistorico`, e afins), mitigando contaminação em cascata nos processadores e na renderização da interface.
  - CNPJs problemáticos e desformatados agora são padronizados uniformemente garantindo os 14 dígitos (base para consultas cruzadas precisas com arquivos satélites).
  - Normalização estrita de strings/títulos (removendo aspas residuais) e de representações geográficas (coalescência bidirecional de Siglas x Nome Completo das UF).
