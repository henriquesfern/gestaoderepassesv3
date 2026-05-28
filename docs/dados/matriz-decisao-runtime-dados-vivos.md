# Matriz de Decisao - Runtime dos Dados Vivos

## Objetivo

Este documento registra a avaliacao preparatoria para uma futura troca do runtime de dados do app, saindo do fluxo legado de `parseData()` para o modelo paralelo de dados vivos.

O objetivo deste bloco e deixar claro o que precisa ser considerado antes de qualquer troca, quais divergencias ainda existem, quais consumidores podem ser afetados e qual caminho reduz o risco operacional.

Nenhuma troca de runtime foi feita nesta etapa.

## Classificacao de Criticidade

- **Bloco atual**: Nivel 2, pois e documental e preparatorio.
- **Troca futura de runtime**: Nivel 3, pois afetara carregamento central de dados, consumidores globais, IA, paineis, validadores e possivelmente experiencia visual.

Pelo protocolo do projeto, a troca futura so deve ocorrer em blocos pequenos, com permissao explicita, validacao tecnica, validacao visual e possibilidade clara de retorno ao runtime anterior.

## Estado Atual do Runtime

Hoje o app usa `src/data/parser.ts` como ponto principal de carregamento por meio de `parseData()`.

O `DataProvider`, em `src/context/DataContext.tsx`, importa `parseData()` e distribui o resultado como `appData` para os consumidores do app.

O retorno atual contem:

- `cden`
- `precursoras`
- `fomento2026`
- `fomentoHistorico`
- `patrocinioHistorico`
- `infraBR`

O modelo de dados vivos ja existe em paralelo em `src/data/dados-vivos`, mas ainda nao substitui o runtime principal.

## Estado Atual dos Dados Vivos

Validacao atual do modelo paralelo:

- `entidades`: 299
- `projetos_base`: 453
- `projetos_fomento`: 230
- `projetos_patrocinio`: 223
- `acompanhamento_projetos`: 107
- `classificacoes_infrabr_projeto`: 738
- Fontes:
  - `fomento2025`: 123 projetos
  - `fomento2026`: 107 projetos
  - `patrocinio2025`: 223 projetos

Validacao atual do adapter de compatibilidade:

- `fomento2026`: 107 registros
- `fomentoHistorico`: 123 registros
- `patrocinioHistorico`: 223 registros
- Divergencias criticas: 0
- Divergencias observacionais: 11 apos a definicao da regra de `CATEGORIA`

Conclusao tecnica: o modelo paralelo esta consistente para observacao e comparacao, mas a troca de runtime ainda exige decisao sobre impactos semanticos e visuais.

## Fronteira Real da Troca

A troca nao deve substituir diretamente todos os consumidores.

O ponto mais seguro de troca e a origem das listas legadas dentro de `parseData()`, preservando a forma de `appData` ja consumida pela UI.

Isso significa que a primeira troca, se aprovada no futuro, deve usar a `legacy view` criada pelo adapter:

- `carregarDadosVivosLegacyView().fomento2026`
- `carregarDadosVivosLegacyView().fomentoHistorico`
- `carregarDadosVivosLegacyView().patrocinioHistorico`

E deve preservar sem alteracao:

- `cden`
- `precursoras`
- `infraBR`

Essa estrategia reduz o impacto porque a UI continuaria recebendo `EntidadeSelecionada`, enquanto a origem das listas passaria a ser o modelo vivo.

## Consumidores Afetados

### Carregamento global

- `src/context/DataContext.tsx`
- `src/data/parser.ts`

Risco: qualquer erro aqui impede o app de carregar dados globais.

### Visao Fomento 2026

- `src/components/Overview.tsx`
- `src/components/Directory.tsx`
- `src/components/FinancialPanel.tsx`
- `src/components/FiscalView.tsx`
- abas em `src/app/router/TabContent.tsx`

Risco: alteracoes em objetivo, categoria, dimensoes, valores e fiscais aparecem diretamente em cards, tabelas, totais e filtros.

### Historicos de Fomento e Patrocinio

- `src/app/router/TabContent.tsx`
- `src/components/Overview.tsx`
- `src/components/Directory.tsx`
- `src/components/FinancialPanel.tsx`

Risco: menor no estado atual, pois as divergencias observacionais restantes estao apenas em `fomento2026`, mas ainda e necessario validar contagens e totais.

### Paineis globais e diretoria geral

- `src/components/GlobalEntitiesOverview.tsx`
- `src/components/GlobalDirectory.tsx`
- `src/hooks/useDirectoryECGeral.ts`
- `src/hooks/useOverviewMetrics.ts`

Risco: mudancas em classificacao, nome, CNPJ, tipo e flags institucionais podem alterar agrupamentos globais.

### Infra-BR e insights

- `src/hooks/useInfraBRMetrics.ts`
- `src/components/InsightsView.tsx`
- `src/components/InsightsECGeral.tsx`
- `src/components/StateForceView.tsx`

Risco: as 6 divergencias de dimensoes podem alterar contagens por dimensao e leituras de aderencia.

### Assistente de IA

- `src/components/AIAssistant.tsx`

Risco: objetivos antes vazios passam a fornecer mais contexto. Isso pode melhorar respostas, mas tambem exige controle para que textos longos nao sejam usados como rótulos classificatorios.

## Campos Sensíveis

### `OBJETIVO`

Impacto positivo esperado:

- preenche lacunas do legado;
- melhora contexto de projeto;
- pode melhorar respostas da IA e buscas por conteudo.

Riscos:

- textos longos podem afetar cards, tabelas ou modais;
- filtros ou resumos que assumem objetivo curto podem perder legibilidade.

Decisao sugerida:

- aceitar preenchimento como enriquecimento, desde que validacao visual confirme que textos longos nao quebram layout.

### `CATEGORIA`

Impacto positivo esperado:

- evita campo vazio em registros antes incompletos.

Riscos:

- `CATEGORIA` costuma funcionar melhor como rotulo curto;
- em 5 casos, o campo pode receber texto amplo equivalente ao objetivo;
- isso pode prejudicar agrupamentos, filtros, badges, resumos ou respostas da IA que tratem categoria como classificacao.

Decisao sugerida:

- nao trocar runtime antes de decidir uma regra especifica para `CATEGORIA`;
- avaliar se `CATEGORIA` deve continuar curta, usando `objetivo_estrategico`, `linha_solicitada`, `status_geral` ou outro campo classificatorio;
- manter texto longo preferencialmente em `OBJETIVO`, `OBJETIVO_COMPLETO` ou campo equivalente.

Regra definida no bloco preparatorio seguinte:

- `CATEGORIA` deve permanecer como campo classificatorio curto;
- para Fomento, a legacy view dos dados vivos deve preencher `CATEGORIA` apenas com `objetivo_estrategico` ou `linha_solicitada`;
- se nao houver rotulo curto confiavel, `CATEGORIA` deve ficar vazia;
- o texto longo do projeto deve permanecer em `OBJETIVO`, `OBJETIVO_COMPLETO` ou campos especificos de Fomento, evitando impacto visual e analitico em filtros, badges e agrupamentos.

### `DIMENSOES`

Impacto positivo esperado:

- incorpora classificacoes Infra-BR validadas adicionais;
- melhora aderencia analitica do Fomento 2026;
- reduz perda de informacao do complemento validado.

Riscos:

- altera contagens por dimensao;
- pode mudar filtros, rankings e agrupamentos;
- pode fazer um projeto aparecer em mais leituras tematicas do que aparecia no legado.

Decisao sugerida:

- aceitar como enriquecimento, mas validar efeitos nos paineis de Infra-BR e nas respostas da IA.

## Divergencias Observacionais Restantes

As divergencias restantes nao sao criticas porque nao alteram contagem, chave, CNPJ, SEI, entidade, estado, valores principais, flags institucionais ou fiscais principais.

Elas representam enriquecimento ou diferenca semantica em campos detalhados de Fomento 2026.

### Grupo 1 - `OBJETIVO`

Total: 5 casos.

Caracteristica:

- legado vazio;
- dados vivos preenchido com texto de objetivo ou descricao tecnica.

Entidades conhecidas:

- ASSOCIACAO DOS ENGENHEIROS AGRONOMOS DO EST R JANEIRO.
- SINDICATO DOS ENGENHEIROS NO ESTADO DO PARA.
- ASSOCIACAO DOS ENG ARQ E ENG AGRON DA REGIAO DE FRANCA.
- AEAPB / Pereira Barreto.
- ASSOCIACAO GUARATINGUETAENSE DE ENGENHEIROS E ARQUITETOS.

Tratamento recomendado:

- aceitar como enriquecimento para `OBJETIVO`;
- validar exibicao visual;
- confirmar que buscas e IA se beneficiam do preenchimento.

### Grupo 2 - `CATEGORIA` - resolvido no adapter paralelo

Total: 5 casos.

Caracteristica:

- legado vazio;
- dados vivos preenchia, em alguns casos, texto longo semelhante ao objetivo.

Entidades conhecidas:

- ASSOCIACAO DOS ENGENHEIROS AGRONOMOS DO EST R JANEIRO.
- SINDICATO DOS ENGENHEIROS NO ESTADO DO PARA.
- ASSOCIACAO DOS ENG ARQ E ENG AGRON DA REGIAO DE FRANCA.
- AEAPB / Pereira Barreto.
- ASSOCIACAO GUARATINGUETAENSE DE ENGENHEIROS E ARQUITETOS.

Tratamento recomendado:

- manter `CATEGORIA` como campo classificatorio curto;
- preencher apenas com `objetivo_estrategico` ou `linha_solicitada`;
- quando nao houver rotulo curto confiavel, manter vazio;
- preservar o texto longo em `OBJETIVO` e campos completos.

Status validado:

- o ajuste removeu as 5 divergencias observacionais de `CATEGORIA`;
- o adapter passou de 16 para 11 divergencias observacionais, mantendo divergencias criticas em zero.

### Grupo 3 - `DIMENSOES`

Total: 6 casos.

Caracteristica:

- dados vivos possui dimensao adicional em relacao ao legado;
- a diferenca vem do enriquecimento das classificacoes validadas do Fomento 2026.

Casos conhecidos:

| CNPJ | Entidade | Diferenca observada |
| --- | --- | --- |
| `46314464000173` | ASSOC DE ENGENHARIA ARQUIT AGRON GEOLOGIA DE RIO CLARO | adiciona `MOBILIDADE` |
| `44645166000130` | ASSOCIACAO DOS ENGENHEIROS DE JUNDIAI | adiciona `AGUA` |
| `83932483000190` | ASSOCIACAO CATARINENSE DE ENGENHEIROS | legado vazio; dados vivos adiciona `BEM-ESTAR SOCIAL E CIDADANIA` |
| `54407911000167` | ASSOCIACAO DE ENGENHEIROS E ARQUITETOS DE PIRACICABA | adiciona `MEIO AMBIENTE E RESILIENCIA` |
| `03598723000122` | IBAPE-AM | legado vazio; dados vivos adiciona `MEIO AMBIENTE E RESILIENCIA` |
| `24355377000121` | ASSOCIACAO DOS ENGENHEIROS DE CAPAO BONITO - SP | adiciona `MOBILIDADE` |

Tratamento recomendado:

- aceitar como enriquecimento validado;
- validar paineis de filtros, contagens por dimensao e IA antes da troca;
- manter registro de que os numeros por dimensao podem mudar apos a troca.

## Criterios de Aceite Para Troca Futura

A troca futura so deve ser considerada pronta quando todos os criterios abaixo forem atendidos.

### Criterios tecnicos obrigatorios

- `npm.cmd run data:validate-dados-vivos` sem erros.
- `npm.cmd run data:validate-dados-vivos-adapter` com divergencias criticas em zero.
- Divergencias observacionais restantes documentadas e aceitas.
- `npm.cmd run dev:check` aprovado.
- `npm.cmd run build` aprovado.
- `npm.cmd run lint` aprovado.

### Criterios de dados

- contagens de `fomento2026`, `fomentoHistorico` e `patrocinioHistorico` preservadas;
- chaves por `CNPJ + SEI` preservadas;
- valores financeiros principais preservados;
- notas e votos preservados;
- flags `IsCDEN` e `IsPrecursora` preservadas;
- divergencias de `OBJETIVO` e `DIMENSOES` decididas explicitamente.

### Criterios visuais

- app carrega sem tela quebrada;
- visao de Fomento 2026 abre normalmente;
- diretorio de Fomento 2026 nao sofre quebra por textos longos;
- painel financeiro preserva totais principais;
- painel fiscal preserva filtros e responsaveis;
- paineis globais preservam navegacao;
- filtros por dimensao continuam compreensiveis;
- assistente de IA responde perguntas simples sem contaminacao por contexto excessivo.

### Criterios operacionais

- runtime legado permanece recuperavel por fallback ou reversao simples;
- PR da troca deve ser pequeno e focado;
- changelog deve indicar claramente que houve troca de origem de dados;
- roadmap deve registrar conclusao ou nova pendencia observacional;
- se houver regressao, a reversao deve ser trivial e localizada.

## Estrategias Possiveis

### Opcao A - Manter observacao paralela

Descricao:

- nao altera runtime;
- continua usando validadores e adapter paralelo;
- adia a decisao de troca.

Vantagens:

- menor risco imediato;
- preserva app exatamente como esta;
- permite avaliar mais perguntas, telas e dados.

Desvantagens:

- dados vivos continuam sem entregar valor direto ao usuario final;
- futuras atualizacoes de arquivos vivos ainda dependem do fluxo legado.

Uso recomendado:

- quando houver duvida sobre objetivos longos ou dimensoes enriquecidas;
- quando nao houver tempo para validacao visual completa.

### Opcao B - Preparar chave controlada de origem

Descricao:

- criar funcao central para montar `appData` com fonte legada ou dados vivos;
- manter legado como fallback;
- permitir comparacao local controlada.

Vantagens:

- reduz risco da troca;
- facilita testes A/B locais;
- permite rollback simples;
- prepara a troca sem forcar ativacao imediata.

Desvantagens:

- adiciona uma camada temporaria de decisao;
- exige cuidado para nao deixar duplicidade confusa no codigo.

Uso recomendado:

- caminho preferencial antes da troca definitiva.

Status do bloco de preparacao:

- `parseData()` passou a aceitar uma opcao explicita de fonte de projetos;
- a fonte padrao permanece `legado`;
- chamadas sem parametros continuam equivalentes a `parseData({ fonteProjetos: 'legado' })`;
- `parseData({ fonteProjetos: 'dados-vivos' })` permite validar a legacy view dos dados vivos sem alterar o app;
- o script `npm.cmd run data:validate-dados-vivos-runtime-source` valida a fonte padrao, a fonte legada explicita e a fonte dados vivos.

### Opcao C - Trocar diretamente `parseData()`

Descricao:

- `parseData()` passa a retornar listas vindas de `carregarDadosVivosLegacyView()`.

Vantagens:

- simples e rapido;
- reduz o fluxo legado de imediato.

Desvantagens:

- maior risco visual e semantico;
- rollback depende de PR/reversao;
- ainda exige validacao visual para objetivos longos e dimensoes enriquecidas.

Uso recomendado:

- somente depois de validar visualmente objetivos longos, dimensoes enriquecidas e fallback de origem.

## Recomendacao Tecnica

O caminho mais seguro e a Opcao B: preparar uma chave controlada de origem, mantendo o legado como fallback e permitindo ativacao controlada dos dados vivos.

O ponto de `CATEGORIA` foi tratado no adapter paralelo antes da troca de runtime, reduzindo o principal risco visual e analitico identificado nesta matriz.

Sequencia recomendada:

1. Manter registrada a regra de derivacao de `CATEGORIA` no adapter de dados vivos.
2. Criar ponto central de montagem de `appData` com fonte selecionavel.
3. Manter a fonte legada como padrao inicial.
4. Validar fonte padrao, fonte legada explicita e fonte dados vivos por script dedicado.
5. Testar fonte de dados vivos localmente com validacao visual.
6. Se aprovado, sincronizar em PR pequeno.
7. Em bloco posterior, decidir se a fonte dados vivos vira padrao.

## Plano de Fallback

Para qualquer troca futura, o fallback deve ser simples.

Regras:

- manter `parseData()` legado intacto ou facilmente recuperavel;
- isolar a selecao da fonte em uma funcao pequena;
- evitar espalhar condicoes pelos componentes;
- nao alterar componentes consumidores no primeiro bloco de troca;
- se a fonte viva falhar, retornar fonte legada ou bloquear a troca antes do merge.

Fallback minimo aceitavel:

```ts
const usarDadosVivos = false;
```

Esse exemplo nao e uma proposta final de implementacao, mas registra o principio: a decisao de origem deve ficar centralizada, visivel e reversivel.

## Momentos Recomendados Para Backup e Rollback

Backup e rollback nao precisam ter o mesmo peso em todos os blocos. A estrategia deve crescer conforme o risco da etapa.

### Momento 1 - Blocos documentais e validadores paralelos

Exemplos:

- documentacao tecnica;
- ajustes em roadmap;
- validadores que nao alteram runtime;
- refinamentos no adapter paralelo sem consumo pela UI.

Protecao recomendada:

- Git local limpo antes de iniciar;
- branch proprio para o bloco;
- PR pequeno;
- merge por squash;
- validadores de dados executados.

Rollback recomendado:

- reverter o PR no GitHub, caso a documentacao ou regra paralela precise ser corrigida;
- nao e necessario backup fisico em `/backups`, pois nao ha alteracao estrutural de runtime nem movimentacao de arquivos.

### Momento 2 - Preparacao de chave controlada de origem

Exemplos:

- criar funcao central para escolher fonte legada ou dados vivos;
- manter runtime legado como padrao;
- deixar dados vivos disponiveis apenas para teste local ou flag interna.

Protecao recomendada:

- PR pequeno e isolado;
- `flow:prepare-pr`;
- validadores de dados;
- validacao visual local;
- preview Vercel antes do merge;
- manter a fonte legada como padrao inicial.

Rollback recomendado:

- desativar a flag ou constante central;
- reverter o PR se a estrutura de selecao gerar instabilidade;
- manter commit de troca separado de qualquer refatoracao visual.

### Momento 3 - Troca do runtime padrao para dados vivos

Exemplos:

- `parseData()` passa a retornar `fomento2026`, `fomentoHistorico` e `patrocinioHistorico` a partir da legacy view dos dados vivos;
- dados vivos viram fonte principal do app.

Protecao recomendada:

- tratar como Nivel 3;
- exigir confirmacao explicita antes de implementar;
- executar validadores antes e depois;
- validar visualmente telas principais;
- abrir PR pequeno apenas com a troca de origem;
- aguardar GitHub Actions e Vercel Preview verdes;
- registrar claramente no PR o plano de rollback.

Rollback recomendado:

- se a troca estiver atras de chave central, retornar a chave para fonte legada;
- se ja estiver mergeada sem chave, usar `Revert` do PR no GitHub;
- se o deploy Vercel em producao apresentar regressao, usar rollback/promote do ultimo deployment estavel da Vercel enquanto o GitHub e corrigido;
- nao misturar a troca de runtime com alteracoes de layout, IA ou dados novos.

### Momento 4 - Migracoes, renomeacoes ou reorganizacao de arquivos vivos

Exemplos:

- mover pastas de dados;
- renomear fontes oficiais;
- substituir arquivos CSV/XLSX/TXT em massa;
- criar nova estrutura canonica de entrada.

Protecao recomendada:

- tratar como Nivel 4 quando envolver movimentacao ampla ou risco de perda estrutural;
- executar `npx tsx scripts/backup.ts` antes da alteracao, conforme protocolo do projeto;
- confirmar que o backup foi criado em `/backups`;
- executar em branch proprio;
- validar contagens e diffs de dados antes do PR.

Rollback recomendado:

- restaurar a partir do backup local quando a falha ocorrer antes do PR;
- reverter PR no GitHub quando a falha ja estiver versionada;
- usar rollback de deployment na Vercel somente se a regressao tiver chegado ao ambiente publicado.

### Momento recomendado para este ciclo

No ciclo atual, ainda nao e necessario backup fisico em `/backups`, porque o ajuste permanece no adapter paralelo e na documentacao.

O primeiro momento em que o backup operacional deve ser reavaliado e antes de qualquer troca efetiva do runtime ou reorganizacao de arquivos de entrada. Para a troca controlada de runtime, o rollback via GitHub e Vercel e suficiente se a mudanca ficar isolada e reversivel.

## Bateria Minima de Validacao Manual

Antes de aprovar troca futura, validar perguntas e telas:

### Telas

- Fomento 2026 - visao geral.
- Fomento 2026 - diretorio.
- Fomento 2026 - financeiro.
- Fomento 2026 - fiscalizacao.
- Historico de Fomento.
- Historico de Patrocinio.
- Visao global de entidades.
- Diretoria global.
- Insights/Infra-BR.

### Perguntas de IA

- Quantos projetos existem no Fomento 2026?
- Quais entidades do Fomento 2026 estao ligadas a Mobilidade?
- Qual o projeto do Sindicato dos Engenheiros no Estado do Para?
- Compare projetos do Fomento 2026 por dimensao Infra-BR.
- Liste projetos com categoria vazia ou indefinida.
- Explique o projeto de uma entidade com objetivo antes vazio no legado.

### Comparacoes de dados

- total de projetos por fonte;
- total financeiro por ciclo;
- top entidades por nota;
- top entidades por valor;
- distribuicao por estado;
- distribuicao por dimensao Infra-BR;
- entidades CDEN;
- entidades precursoras.

## Decisoes Pendentes

- Se as 11 divergencias observacionais restantes devem continuar aparecendo no validador ou migrar para uma lista de excecoes documentadas.
- Se a primeira troca usara flag local, constante interna ou funcao dedicada de selecao.
- Se a fonte dados vivos deve virar padrao no primeiro PR ou apenas ficar disponivel para teste.
- Se a validacao visual deve ser feita apenas localmente ou tambem com preview Vercel antes do merge.

## Proxima Acao Recomendada

Executar validacao visual local com a fonte dados vivos selecionada explicitamente, mantendo a fonte padrao do app como legado.

Essa validacao deve verificar carregamento, telas principais de Fomento 2026, diretorio, paineis globais e pontos afetados por `OBJETIVO` longo e `DIMENSOES` enriquecidas.
