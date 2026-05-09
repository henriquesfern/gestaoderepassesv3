# Diretrizes de Comunicação e Desenvolvimento

- **Idioma**: Todas as comunicações, resumos de alterações, comentários de código (quando novos) e metadados de sincronização (como descrições de commits/PRs) DEVEM ser escritos em **Português do Brasil (pt-BR)**.
- **Contexto**: Este projeto é um dashboard de monitoramento de fomento e infraestrutura voltado para o cenário brasileiro.
- **Registro Contínuo de Alterações**: Imediatamente após realizar qualquer alteração construtiva no código, o agente DEVE documentar a mudança no arquivo `CHANGELOG_PENDING.md` em Português do Brasil.
- **Sincronismo com GitHub**: Ao realizar a exportação/sincronismo com o GitHub, o assistente (e a ferramenta de integração) DEVE usar o conteúdo de `CHANGELOG_PENDING.md` para gerar as de descrições de Commits/PRs detalhando TODAS as entregas agrupadas, estritamente em **Português do Brasil (pt-BR)**.

## Protocolo de Criticidade de Ações e Prevenção de Falhas

Para evitar perdas de estrutura, alterações drásticas e quebras do sistema, todas as ações a serem executadas devem ser avaliadas sob a ótica de **4 Níveis de Criticidade**. Dependendo do nível, o agente DEVE seguir o protocolo adequado ANTES de executar as modificações.

### Nível 1: Baixo (Ajustes Cosméticos e Simples)
- **O que inclui**: Alterações de texto, traduções, ajustes em cores/CSS, pequenas mudanças de layout de componentes que não impactam regras de negócio ou estrutura.
- **Procedimento**: Pode ser executado imediatamente. Nenhuma aprovação ou backup especial é necessário. Atualize o `CHANGELOG_PENDING.md` normalmente após a mudança.

### Nível 2: Moderado (Novos Componentes ou Lógica Local)
- **O que inclui**: Criação de um novo componente de UI isolado, adição de um endpoint ou lógica que não afeta fluxos core, novos arquivos em áreas restritas.
- **Procedimento**: Executo as verificações de contexto (`view_file`), explico e planejo brevemente com você o que será feito e executo a ação. Não precisa de backup manual. Atualizar log.

### Nível 3: Alto (Refatoração Core, APIs Base ou Estruturas Globais)
- **O que inclui**: Mudanças no esquema do banco de dados/Firebase, alteração em fluxos globais (roteamento, autenticação), modificação da arquitetura base ou bibliotecas críticas gerando ampla refatoração.
- **Procedimento**: 
  1. Parar e apresentar o planejamento exato para o usuário. 
  2. Solicitar **permissão explícita** para prosseguir. 
  3. Fazer pequenas entregas sequenciais caso aprovado, testando tudo (`compile_applet`) entre etapas.

### Nível 4: Crítico (Manipulação de Pastas Raiz, Apagar Histórico, Migrações/Renomeação em Massa)
- **O que inclui**: Mover todo o projeto para nova estrutura, deletar diretórios fundamentais (como `src` ou `api`), migrações complexas. Mudanças estruturais perigosas que afetam múltiplos arquivos de uma vez.
- **Procedimento**: 
  1. Exigir do usuário a **aprovação explícita da Ação Crítica**.
  2. O agente DEVE rodar o script de backup (`npx tsx scripts/backup.ts`) ANTES de alterar ou mover arquivos.
  3. Validar se o backup foi criado em `/backups`.
  4. Executar os comandos de forma cuidadosa e validadora.
