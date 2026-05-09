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
- Criação e inclusão do **Protocolo de Criticidade de Ações e Prevenção de Falhas (Níveis 1 a 4)** no arquivo `AGENTS.md` para mitigar riscos de quebra do sistema e perdas estruturais.
- Criação do utilitário `scripts/backup.ts` para ser acionado antes de manobras de nível Crítico (Nível 4), automatizando o clone/backup preventivo do diretório raiz `src`.
- Evolução do utilitário `scripts/backup.ts` para executar o backup de 100% da estrutura do projeto a partir da raiz, ignorando automaticamente pastas irrelevantes ou redundantes como `node_modules`, `dist`, `backups` e `.git`.
- Criação de utilitário isolado (`src/utils/sanitizers.ts`) para tratamento e normalização de dados, mitigando inconsistências de banco de dados e APIs como: strings (aspas excedentes e crases no lugar de apóstrofos), formatações de CNPJ (remoção de máscaras e padronização com "zeros" à esquerda para manter 14 dígitos), e cruzamento geográfico (conversões lógicas bidirecionais entre Sigla da UF "SP" e Nome Completo "São Paulo"). Ação baseada no protocolo Nível 3.
- Restauração de integridade do diretório `src`: recriação dos arquivos base `main.tsx`, `App.tsx` e `index.css` que haviam sido perdidos, para solucionar erro de compilação do Vite (`Failed to resolve /src/main.tsx`).
- Criação e inicialização do arquivo base de contexto `src/editais-context.ts` afim de solucionar erro de execução `ERR_MODULE_NOT_FOUND` que quebrava o serviço na rota de IA (`/api/chat.ts`).
- Correção da importação nos arquivos `api/chat.ts` e `server.ts` para usar a extensão `.ts` (ao invés de `.js`), resolvendo efetivamente o erro de `ERR_MODULE_NOT_FOUND` e validando o build do projeto.
