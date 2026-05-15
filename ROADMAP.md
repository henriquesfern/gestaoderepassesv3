# Roadmap e Melhorias Futuras

Este documento centraliza melhorias futuras, próximos passos, ideias em avaliação e registros de planejamento que ainda não pertencem ao `CHANGELOG.md` nem ao `CHANGELOG_PENDING.md`.

## Papel dos Arquivos de Registro

- `CHANGELOG_PENDING.md`: registra entregas locais ainda não sincronizadas com GitHub/PR. É temporário e não versionado.
- `CHANGELOG.md`: registra evolução já entregue e consolidada.
- `ROADMAP.md`: registra demandas futuras, hipóteses de melhoria, próximos passos e decisões de planejamento ainda não executadas.

## Em Aberto

### Refinar ranqueamento dos normativos na IA

- **Status**: Em aberto, sem pendência ativa.
- **Origem**: Conversa de 15/05/2026.
- **Contexto**: A integração atual dos editais e normativos com a IA foi considerada adequada após testes de uso real. No futuro, o ranqueamento dos trechos poderá ser refinado se surgirem evidências de respostas pouco precisas ou seleção documental insuficiente.
- **Criticidade estimada**: Nível 2, caso envolva apenas calibragem local de pesos, metadados e seleção de chunks.
- **Próxima ação sugerida**: Coletar exemplos reais de perguntas e respostas, avaliar quais documentos foram recuperados e ajustar pesos por tipo, ano, errata, palavras-chave e prioridade documental.

### Padronizar modelo canônico de dados em Português-BR

- **Status**: Em aberto, dependente da conclusão da Fase 0 + Fase 1 da governança de dados.
- **Origem**: Conversa de 15/05/2026 sobre normalização dos dados de Infra-BR, fomento, patrocínio e entidades.
- **Contexto**: A futura Fase 2 deve padronizar nomes de tabelas, campos e schemas usando identificadores em Português-BR, preservando clareza de domínio para o projeto. Exemplos desejados: `infra_componentes` em vez de `infra_components`, `entidades` em vez de `entities`, `projetos` em vez de `projects` e `repasses` em vez de `grants`.
- **Criticidade estimada**: Nível 3, pois a padronização pode atingir contratos internos, adapters, schemas, hooks e componentes consumidores.
- **Próxima ação sugerida**: Após o inventário e a definição das fontes oficiais, propor um dicionário canônico em pt-BR com mapeamento entre colunas brutas, campos normalizados e consumidores no app.

## Em Avaliação

Não há itens em avaliação neste momento.

## Priorizado

### Governança inicial da camada de dados

- **Status**: Priorizado para execução em Fase 0 + Fase 1.
- **Origem**: Conversa de 15/05/2026 sobre estrutura e performance dos datasets em `src/data` e `public/data`.
- **Contexto**: A camada atual combina CSVs estáticos, arquivos TypeScript com dados embutidos, adapters, schema, loaders runtime e pipeline legado. Antes de normalizar nomes e relacionamentos, é necessário registrar inventário, consumidores, chaves e fonte oficial de cada dataset.
- **Criticidade estimada**: Nível 2 para inventário e documentação; pode evoluir para Nível 3 se a etapa seguinte alterar contratos de dados consumidos pelo app.
- **Próxima ação sugerida**: Versionar o inventário inicial em `docs/dados/inventario-camada-dados.md`, confirmar as fontes oficiais e só então planejar a Fase 2 de normalização canônica.

## Concluído

### Ações estruturais anteriores

- **Ação A**: Concluída. Centralização de tipos/interfaces.
- **Ação B**: Concluída. Refatoração do parser com separação de responsabilidades.
- **Ação C**: Concluída. Fragmentação de monolitos de interface e separação de regras.
- **Ação D**: Concluída. Fragmentação dos monolitos de tabelas.
- **Ação E**: Concluída. Refatoração de insights em `InfraBRInsights.tsx`.
- **Ação F**: Concluída. Evolução em UX/UI nas visualizações e acessibilidade.
- **Ação G**: Concluída. Refatoração dinâmica com contexto global.

## Modelo Para Novos Registros

Use este padrão quando uma melhoria futura, próximo passo ou hipótese técnica precisar ser preservada:

```md
### Título objetivo da melhoria

- **Status**: Em aberto | Em avaliação | Priorizado | Concluído.
- **Origem**: Conversa, PR, issue, teste ou observação que gerou o item.
- **Contexto**: Por que o item existe e qual problema ou oportunidade representa.
- **Criticidade estimada**: Nível 1, 2, 3 ou 4, conforme o protocolo do `AGENTS.md`.
- **Próxima ação sugerida**: Primeiro passo seguro para transformar o item em trabalho executável.
```
