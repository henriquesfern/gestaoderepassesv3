# Diretrizes de Comunicação e Desenvolvimento

- **Idioma**: Todas as comunicações, resumos de alterações, comentários de código (quando novos) e metadados de sincronização (como descrições de commits/PRs) DEVEM ser escritos em **Português do Brasil (pt-BR)**.
- **Contexto**: Este projeto é um dashboard de monitoramento de fomento e infraestrutura voltado para o cenário brasileiro.
- **Registro Contínuo de Alterações**: Imediatamente após realizar qualquer alteração construtiva no código, o agente DEVE documentar a mudança no arquivo `CHANGELOG_PENDING.md` em Português do Brasil.
- **Sincronismo com GitHub**: Ao realizar a exportação/sincronismo com o GitHub, o assistente (e a ferramenta de integração) DEVE usar o conteúdo de `CHANGELOG_PENDING.md` para gerar as de descrições de Commits/PRs detalhando TODAS as entregas agrupadas, estritamente em **Português do Brasil (pt-BR)**.
