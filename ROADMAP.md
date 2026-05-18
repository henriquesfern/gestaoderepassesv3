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

### Consolidar a migracao gradual do consumo Infra-BR canonico

- **Status**: Em aberto, com fonte principal canonica em validacao controlada.
- **Origem**: Revisao posterior aos PRs de ampliacao do consumo canonico Infra-BR em 18/05/2026.
- **Contexto**: Os principais pontos de consumo em runtime ja selecionam dados Infra-BR por `selecionarInfraBRParaConsumo`, mantendo fallback legado. A varredura atual nao identificou usos diretos de `appData.infraBR` fora desse seletor em componentes e hooks consumidores.
- **Criticidade estimada**: Nivel 3, pois a proxima consolidacao pode alterar o ponto de entrada dos dados e reduzir dependencias do fluxo legado.
- **Opcoes avaliadas**:
  - **Opcao 1 - Manter o fluxo atual por mais um ciclo**: preservar o seletor canonico com fallback legado ate haver mais validacao de uso real.
  - **Opcao 2 - Criar loader canonico paralelo**: criar um loader que entregue `InfraRuntimeData` a partir da legacy view canonica e validar equivalencia contra o loader legado, ainda sem trocar o app.
  - **Opcao 3 - Trocar a fonte principal agora**: fazer `buildAppData`/`parseData` entregarem o modelo canonico como fonte principal, com maior risco por atingir a camada de entrada dos dados.
- **Proxima acao sugerida**: Validar visualmente a tela Infra-BR e pontos consumidores apos a troca controlada da fonte principal, mantendo os validadores de equivalencia ativos antes de remover fluxos legados.

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

### Ampliacao gradual do consumo canonico Infra-BR

- **Status**: Concluido.
- **Origem**: Avaliacao posterior ao uso gradual da legacy view canonica no `useInfraBRMetrics`, validado visualmente em 18/05/2026.
- **Contexto**: A legacy view canonica foi ampliada em blocos pequenos para Overview, assistente de IA, diretorio e mapa global, sempre por meio de `selecionarInfraBRParaConsumo` e com fallback legado preservado.
- **Criticidade estimada**: Nivel 3, executado em PRs pequenos e sequenciais.
- **Resultado**: Os principais consumidores de runtime deixam de acessar diretamente a estrutura Infra-BR bruta e passam a depender do seletor canonico gradual.
- **Proxima acao sugerida**: Manter o fallback legado por enquanto e avaliar, em etapa propria, a consolidacao do loader canonico como fonte principal.

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
