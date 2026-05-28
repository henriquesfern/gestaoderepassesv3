# Roadmap e Melhorias Futuras

Este documento centraliza melhorias futuras, proximos passos, ideias em avaliacao e registros de planejamento que ainda nao pertencem ao `CHANGELOG.md` nem ao `CHANGELOG_PENDING.md`.

## Papel dos Arquivos de Registro

- `CHANGELOG_PENDING.md`: registra entregas locais ainda nao sincronizadas com GitHub/PR. E temporario e nao versionado.
- `CHANGELOG.md`: registra evolucao ja entregue e consolidada.
- `ROADMAP.md`: registra demandas futuras, hipoteses de melhoria, proximos passos e decisoes de planejamento ainda nao executadas.

## Em Aberto

### Governanca e automacao dos dados vivos de entidades e projetos

- **Status**: Em aberto.
- **Origem**: Conversa de 26/05/2026 sobre evolucao da estrutura de dados para projetos vivos de Fomento 2026 e futuros ciclos de Patrocinio 2026/2027.
- **Contexto**: O app usa hoje varias fontes de entidades, projetos, acompanhamentos e classificacoes adaptadas para a visao final `EntidadeSelecionada`. A proxima evolucao deve separar cadastro estavel de entidades, base comum de projetos, dados especificos de Fomento, dados especificos de Patrocinio, acompanhamento vivo e tabelas auxiliares, preservando entrada gratuita por CSV, XLSX ou TXT.
- **Criticidade estimada**: Nivel 3 para implementacao estrutural, pois podera afetar parsers, schemas, validadores, dados centrais e consumidores do app. A etapa atual e apenas documental e de criticidade Nivel 2.
- **Registro tecnico inicial**: `docs/dados/governanca-dados-vivos-entidades-projetos.md`.
- **Registro da Fase 0**: `docs/dados/inventario-fase-0-dados-vivos.md`.
- **Status da Fase 1 paralela**: Schemas, normalizers e validacao implementados para `entidades`, `projetos_base`, `projetos_fomento`, `projetos_patrocinio`, `acompanhamento_projetos` e `classificacoes_infrabr_projeto`, sem troca de runtime.
- **Status da Fase 2 paralela**: Adapter inicial de compatibilidade criado para reconstruir `fomento2026`, `fomentoHistorico` e `patrocinioHistorico` a partir do modelo de dados vivos, com validacao critica e observacional por `npm.cmd run data:validate-dados-vivos-adapter`.
- **Status do enriquecimento Infra-BR**: `classificacoes_infrabr_projeto` passou a carregar dimensoes, componentes e indicadores validados do Fomento 2026, incluindo rankings, scores e termos detectados por nivel, ainda sem troca de runtime.
- **Status dos controles de Fomento 2026**: Votos, controle de orcamento e controle de projeto foram incorporados ao registro especifico de Fomento 2026 no modelo paralelo e ao adapter de compatibilidade.
- **Status do Fomento historico**: Codigos de linha solicitada do Fomento 2025 foram normalizados para os rotulos legados equivalentes no modelo paralelo.
- **Status das datas do Fomento historico**: Datas ausentes do Fomento 2025 foram compatibilizadas no adapter legado com `-`, preservando o modelo paralelo normalizado.
- **Status do Patrocinio historico**: Categorias do Patrocinio 2025 foram formatadas no adapter de compatibilidade conforme a regra legada, usando `TipoPublicacao` para publicacoes e capitalizacao amigavel.
- **Status das fontes validadas do Fomento 2026**: O CSV validado do Fomento 2026 foi alinhado entre `public/data`, `src/data` e a fonte embutida `newFomentoData.ts`, reduzindo divergencias observacionais do adapter de 362 para 45.
- **Status dos criterios de comparacao observacional**: O validador do adapter passou a ignorar diferencas apenas de whitespace textual e a tratar `Nao classificado` versus vazio como equivalentes em campos de dimensao.
- **Status da comparacao de dimensoes**: Dimensoes do Fomento 2026 passaram a ser comparadas no validador como conjunto normalizado, reduzindo ruido de ordem e duplicidade na visao legada.
- **Status de fechamento da compatibilidade**: As 16 divergencias observacionais restantes do Fomento 2026 foram aceitas como enriquecimento do modelo paralelo, compostas por preenchimento textual novo em `OBJETIVO`/`CATEGORIA` e classificacoes Infra-BR adicionais em `DIMENSOES`.
- **Matriz de decisao do runtime**: `docs/dados/matriz-decisao-runtime-dados-vivos.md` registra consumidores afetados, campos sensiveis, divergencias observacionais, criterios de aceite, estrategias possiveis e plano de fallback antes de qualquer troca de runtime.
- **Proxima acao sugerida**: Tratar a regra de `CATEGORIA` no adapter de dados vivos, sem trocar runtime, antes de preparar uma chave controlada de origem ou qualquer troca efetiva.

### Acompanhamento futuro da consulta IA Infra-BR

- **Status**: Em aberto.
- **Origem**: Fechamento do ciclo de evolucao da consulta IA/Infra-BR em 26/05/2026, apos testes reais com perguntas diretas, comparativas e de aprofundamento por indicadores.
- **Contexto**: A consulta da IA para Infra-BR foi evoluida para responder de forma mais direta em perguntas simples, preservar contexto ampliado quando solicitado e evitar contaminacao por fomento ou normativos em perguntas explicitamente Infra-BR. O assunto deve ser retomado futuramente apenas apos nova rodada de uso real, com exemplos concretos de falhas ou oportunidades de refinamento.
- **Criticidade estimada**: Nivel 2, desde que os proximos ajustes continuem restritos ao roteamento e ao construtor de contexto da IA.
- **Proxima acao sugerida**: Reunir novas perguntas e respostas reais em uma bateria de validacao antes de qualquer nova alteracao no codigo.

### Roteirizacao de intencao do contexto Infra-BR na IA

- **Status**: Em aberto.
- **Origem**: Testes de uso real da IA em 25/05/2026 com perguntas sobre dimensoes, componentes e indicadores do Infra-BR.
- **Contexto**: A reducao do contexto Infra-BR por nivel de pergunta melhorou respostas diretas, mas a IA ainda precisa preservar capacidade de respostas complexas quando o usuario pedir comparacao, catalogo, composicao ou diagnostico. A proxima evolucao deve evitar excesso de contexto em perguntas simples sem impedir aprofundamento quando solicitado explicitamente.
- **Criticidade estimada**: Nivel 2, caso a implementacao permaneça restrita ao construtor de contexto Infra-BR da IA e as validacoes sejam feitas com perguntas reais simples e complexas.
- **Estrutura proposta**:
  - **Nivel do dado**: `geral`, `dimensao`, `componente` ou `indicador`.
  - **Modo da resposta**: `direta`, `comparativa`, `catalogo`, `composicao` ou `diagnostico`.
  - **direta**: enviar somente o item solicitado, com nota e rank quando aplicavel.
  - **comparativa**: enviar o mesmo nivel solicitado para as UFs, regioes ou ranking pedido, sem expandir para filhos automaticamente.
  - **catalogo**: enviar apenas listas ou estrutura minima necessaria, sem notas desnecessarias.
  - **composicao**: enviar o item pai e seus filhos diretos, como dimensao -> componentes ou componente -> indicadores.
  - **diagnostico**: enviar o item solicitado e filhos diretos de forma controlada, permitindo explicar desempenho, pontos fortes e pontos fracos.
- **Resultado do ciclo atual**: A consulta IA/Infra-BR passou a distinguir nivel do dado e modo de resposta, reduzir excesso de contexto em perguntas simples, isolar perguntas explicitamente Infra-BR de fomento/normativos e abrir indicadores filhos quando solicitado.
- **Proxima acao sugerida**: Antes de qualquer nova implementacao, montar uma bateria de perguntas reais que explicite o nivel esperado, o modo de resposta e o contexto necessario para cada caso.

## Em Avaliacao

Nao ha itens em avaliacao neste momento.

## Priorizado

Nao ha itens priorizados pendentes neste momento.

## Concluido

### Refinar ranqueamento dos normativos na IA

- **Status**: Concluido.
- **Origem**: Conversa de 15/05/2026.
- **Contexto**: A integracao dos editais e normativos com a IA foi refinada apos avaliacao de exemplos reais de recuperacao documental, priorizando correspondencias explicitas em titulo, arquivo e identificadores normativos.
- **Criticidade estimada**: Nivel 2, pois envolveu calibragem local de pesos em `api/ai.ts`, sem alterar parser de PDFs nem indice gerado.
- **Resultado**: Perguntas com identificadores explicitos, como Decisao Normativa 122, Lei 14.133 e numero de portaria, passam a favorecer o documento diretamente citado antes dos boosts genericos por tipo documental.

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

### Consolidacao final do consumo runtime Infra-BR canonico

- **Status**: Concluido para consumidores runtime; pendente apenas acompanhamento de uso real.
- **Origem**: Revisao posterior aos PRs de ampliacao do consumo canonico Infra-BR em 18/05/2026.
- **Contexto**: A fonte principal do Infra-BR ja e canonica em `parseData` e `buildAppData`. A reducao da camada de transicao foi concluida nos consumidores runtime (`DirectoryRow`, `GlobalEntitiesOverview`, hooks de insights e overview, e assistente de IA), preservando validadores de equivalencia canonica contra o legado.
- **Criticidade estimada**: Nivel 3, pois a consolidacao alterou dependencias do fluxo legado em blocos pequenos e validados.
- **Resultado**: `selecionarInfraBRParaConsumo` deixou de ser usado em runtime; o consumo do app passa por `appData.infraBR`, alimentado pelo loader canonico.
- **Proxima acao sugerida**: Acompanhar uso real e manter os validadores de equivalencia enquanto houver necessidade de comparar a legacy view canonica com a fonte legada.

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
