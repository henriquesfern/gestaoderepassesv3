# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- Reestruturação visual da seção de Aderência Infra-BR no componente `Directory.tsx`.
- Substituição da grade paralela de 3 colunas (Dimensões, Componentes, Indicadores) por uma visualização hierárquica em formato de árvore (Dimensão ┬─> Componente └─> Indicador).
- Implementação da função `buildTree` para classificar, relacionar e aninhar hierarquicamente Componentes e Indicadores dentro de suas respectivas Dimensões usando a taxonomia `infraData.detalhamento`.
- Preservação do esquema de classificação e herança visual de cores pré-definidas em todos os níveis da hierarquia.
- Ocultação dos indicadores de ranking (1º, 2º, etc.) nos níveis secundários (Componentes e Indicadores), focando a visualização de classificação exclusivamente na raiz da respectiva Dimensão.
- Exclusão do elemento visual que exibia o "Foco primário do algoritmo", uma vez que o ranking de dimensões já supre a mesma função informacional redundante.
- Remoção do termo "(Ranking M3)" da interface do usuário em todas as áreas onde o conceito de aderência ao Infra-BR é explicitado, evitando ambiguidades.
