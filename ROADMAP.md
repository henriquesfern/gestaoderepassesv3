# Roadmap e Melhorias Futuras

Este documento centraliza melhorias futuras, proximos passos, ideias em avaliacao e registros de planejamento que ainda nao pertencem ao `CHANGELOG.md` nem ao `CHANGELOG_PENDING.md`.

## Papel dos Arquivos de Registro

- `CHANGELOG_PENDING.md`: registra entregas locais ainda nao sincronizadas com GitHub/PR. E temporario e nao versionado.
- `CHANGELOG.md`: registra evolucao ja entregue e consolidada.
- `ROADMAP.md`: registra demandas futuras, hipoteses de melhoria, proximos passos e decisoes de planejamento ainda nao executadas.

## Em Aberto

### Refinar ranqueamento dos normativos na IA

- **Status**: Em aberto, sem pendencia ativa.
- **Origem**: Conversa de 15/05/2026.
- **Contexto**: A integracao atual dos editais e normativos com a IA foi considerada adequada apos testes de uso real. No futuro, o ranqueamento dos trechos podera ser refinado se surgirem evidencias de respostas pouco precisas ou selecao documental insuficiente.
- **Criticidade estimada**: Nivel 2, caso envolva apenas calibragem local de pesos, metadados e selecao de chunks.
- **Proxima acao sugerida**: Coletar exemplos reais de perguntas e respostas, avaliar quais documentos foram recuperados e ajustar pesos por tipo, ano, errata, palavras-chave e prioridade documental.

### Ampliar consumo canonico Infra-BR para outros pontos da aplicacao

- **Status**: Em aberto, com primeira ampliacao priorizada.
- **Origem**: Avaliacao posterior ao uso gradual da legacy view canonica no `useInfraBRMetrics`, validado visualmente em 18/05/2026.
- **Contexto**: A legacy view canonica ja esta integrada ao caminho principal da tela Infra-BR com fallback para o legado. Ainda restam usos diretos de `appData.infraBR` em pontos de Overview, assistente de IA, diretorio e visoes globais.
- **Criticidade estimada**: Nivel 3, pois pode atingir loaders, adapters, hooks e componentes consumidores.
- **Opcoes avaliadas**:
  - **Opcao 1 - `useOverviewMetrics` + `OverviewMap`**: melhor proximo bloco, por centralizar boa parte do consumo visual do Overview e permitir uso do seletor canonico com fallback, sem alterar parser global.
  - **Opcao 2 - `AIAssistant`**: viavel em bloco posterior, mas com validacao menos objetiva por afetar contexto enviado a IA.
  - **Opcao 3 - `DirectoryRow`**: deixar para depois, pois impacta arvore visual e cores de aderencia em listas expansivas.
- **Proxima acao sugerida**: Executar a Opcao 1 em bloco pequeno, usando `selecionarInfraBRParaConsumo` no `useOverviewMetrics` e passando a fonte selecionada ao `OverviewMap`.

## Em Avaliacao

Nao ha itens em avaliacao neste momento.

## Priorizado

Nao ha itens priorizados pendentes neste momento.

## Concluido

### Governanca inicial da camada de dados

- **Status**: Concluido.
- **Origem**: Conversa de 15/05/2026 sobre estrutura e performance dos datasets em `src/data` e `public/data`.
- **Contexto**: Foram registrados inventario inicial, consumidores principais, chaves de relacionamento e fontes oficiais propostas em `docs/dados/inventario-camada-dados.md`.
- **Criticidade estimada**: Nivel 2 para inventario e documentacao.
- **Resultado**: A Fase 0 + Fase 1 da governanca de dados foi registrada e sincronizada.

### Fase 2 funcional do modelo canonico Infra-BR

- **Status**: Concluido.
- **Origem**: Conversas e PRs de 15/05/2026 sobre normalizacao dos datasets Infra-BR.
- **Contexto**: A Fase 2 criou tipos, schemas e normalizers canonicos em paralelo, preservando a convencao `infra_br_*` para arquivos de origem Infra-BR e sem substituir runtime, loaders, hooks ou componentes da UI.
- **Criticidade estimada**: Nivel 3, executado em blocos pequenos e validados.
- **Resultado**: A validacao `npm run data:validate-canonical-infra` confirma 27 estados, 6 dimensoes, 162 valores por dimensao, 20 componentes, 540 valores por componente, 67 indicadores e 1.809 detalhes por indicador.
- **Proxima acao sugerida**: Criar adapter de consumo do modelo canonico completo, mantendo compatibilidade com a UI atual.

### Acoes estruturais anteriores

- **Acao A**: Concluida. Centralizacao de tipos/interfaces.
- **Acao B**: Concluida. Refatoracao do parser com separacao de responsabilidades.
- **Acao C**: Concluida. Fragmentacao de monolitos de interface e separacao de regras.
- **Acao D**: Concluida. Fragmentacao dos monolitos de tabelas.
- **Acao E**: Concluida. Refatoracao de insights em `InfraBRInsights.tsx`.
- **Acao F**: Concluida. Evolucao em UX/UI nas visualizacoes e acessibilidade.
- **Acao G**: Concluida. Refatoracao dinamica com contexto global.

## Modelo Para Novos Registros

Use este padrao quando uma melhoria futura, proximo passo ou hipotese tecnica precisar ser preservada:

```md
### Titulo objetivo da melhoria

- **Status**: Em aberto | Em avaliacao | Priorizado | Concluido.
- **Origem**: Conversa, PR, issue, teste ou observacao que gerou o item.
- **Contexto**: Por que o item existe e qual problema ou oportunidade representa.
- **Criticidade estimada**: Nivel 1, 2, 3 ou 4, conforme o protocolo do `AGENTS.md`.
- **Proxima acao sugerida**: Primeiro passo seguro para transformar o item em trabalho executavel.
```
