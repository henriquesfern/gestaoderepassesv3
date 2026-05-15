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

## Em Avaliação

Não há itens em avaliação neste momento.

## Priorizado

Não há itens priorizados para execução imediata neste momento.

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
