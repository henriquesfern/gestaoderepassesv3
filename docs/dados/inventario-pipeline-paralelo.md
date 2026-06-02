# Inventario do Pipeline Paralelo em `src/data/pipeline`

## Objetivo

Registrar o estado atual do pipeline paralelo de dados, identificar seu uso real no repositorio e recomendar o destino mais seguro para a estrutura.

Este documento nao executa remocao nem consolidacao. Ele apenas fecha o inventario tecnico e a decisao recomendada para a proxima fase.

## Escopo Avaliado

- `src/data/pipeline/ingest.ts`
- `src/data/pipeline/transform.ts`
- `src/data/pipeline/buildAppData.ts`
- `src/data/pipeline/types.ts`
- `src/data/parser.ts`
- referencias documentais em `docs/dados/*`

## Estrutura Atual

### `ingest.ts`

Responsavel por montar a carga bruta em memoria:

- faz parse de `cdenCSV` e `precursorasCSV`;
- faz parse de `fomento2025CSV`, `fomento2026CSV` e `patrocinioCSV`;
- faz parse de `newFomentoCSV` com delimitador `;`;
- monta `newFomentoMap` e `gestao26Map`.

### `transform.ts`

Responsavel por adaptar os registros brutos para a visao legada consumida pelo app:

- chama `adaptFomento2025`;
- chama `adaptFomento2026`;
- chama `adaptPatrocinio2025`;
- devolve `cden`, `precursoras`, `fomento2026`, `fomentoHistorico` e `patrocinioHistorico`.

### `buildAppData.ts`

Responsavel por compor o resultado final:

- executa `ingestRawData()`;
- executa `transformData(raw)`;
- acopla `infraBR` por `loadInfraBRCanonicoRuntimeData()`.

### `types.ts`

Define apenas a interface `ParsedRawData` usada internamente pelo pipeline.

## Achados Tecnicos

### 1. O pipeline nao aparece como dependencia ativa do runtime principal

Na busca por referencias de uso, `buildAppData`, `ingestRawData` e `transformData` nao aparecem consumidos fora da propria pasta `src/data/pipeline`.

Isso indica que:

- o `DataContext` nao depende desse pipeline;
- o runtime principal do app nao depende dele;
- os scripts operacionais recentes tambem nao dependem dele.

### 2. O runtime principal ja possui um caminho oficial mais atual

O fluxo efetivamente usado pelo app passa por `src/data/parser.ts`, que hoje:

- consome arquivos oficiais em `public/data`;
- usa `fetchStaticText` e `parseCsvRows`;
- respeita `FONTE_PROJETOS_RUNTIME_PADRAO = 'dados-vivos'`;
- mantem a selecao controlada entre `legado` e `dados-vivos`.

Isso coloca o pipeline em um papel paralelo, e nao principal.

### 3. O pipeline replica conceitos ja presentes no parser

Ha duplicacao clara de responsabilidades:

- parse de datasets de fomento e patrocinio;
- montagem de mapas auxiliares por CNPJ;
- uso dos mesmos adapters legados;
- composicao final de `appData`.

Na pratica, isso cria duas arquiteturas conceituais para o mesmo dominio:

- `parser.ts`, que e o caminho real de runtime;
- `src/data/pipeline`, que e um caminho alternativo sem consumo real identificado.

### 4. O pipeline ainda reflete premissas de uma fase anterior

Mesmo com a migracao do `Fomento 2026` para consumo direto dos CSVs oficiais, o pipeline ainda carrega a logica de uma fase mais antiga:

- trata `fomento2025CSV` e `patrocinioCSV` como strings embutidas;
- usa `fomento2026CSV` e `newFomentoCSV` por reexport local;
- monta a camada de acompanhamento por `gestaofomento26`.

Ou seja, ele continua coerente tecnicamente, mas ja nao representa a camada operacional mais atual do projeto.

## Riscos de Manter Como Esta

- Ambiguidade arquitetural sobre qual e a fonte real de verdade.
- Aumento de custo cognitivo para manutencao futura.
- Risco de alguem evoluir o pipeline achando que ele afeta o runtime.
- Duplicacao de regras de ingestao e transformacao.
- Maior dificuldade para futuras migracoes da governanca de dados vivos.

## Opcoes de Destino

### Opcao A - Promover o pipeline a caminho principal

Nao recomendada neste momento.

Motivo:

- exigiria substituir ou reencaixar `parser.ts`;
- elevaria bastante a criticidade da fase;
- nao ha evidencia atual de que o pipeline entregue valor melhor que o runtime vigente.

### Opcao B - Manter como ferramental paralelo oficialmente isolado

Possivel, mas so faria sentido se houvesse um objetivo claro, como:

- laboratorio de transformacao;
- comparador de saida;
- base para futura refatoracao de runtime.

Hoje esse objetivo nao esta explicito no codigo nem na operacao.

### Opcao C - Tratar como legado tecnico candidato a desativacao gradual

Esta e a opcao recomendada.

Ela preserva seguranca porque:

- nao remove nada imediatamente;
- reconhece que o pipeline nao e parte do runtime atual;
- permite uma fase seguinte pequena e controlada para decidir entre isolamento final ou remocao.

## Decisao Recomendada

O destino mais seguro hoje e:

**classificar `src/data/pipeline` como legado tecnico sem consumo runtime identificado e preparar uma fase propria de desativacao gradual ou isolamento definitivo.**

Essa decisao e melhor do que promover ou expandir o pipeline agora porque:

- o fluxo oficial do `Fomento 2026` acabou de ser estabilizado;
- o parser principal ja esta funcional e validado;
- nao ha ganho proporcional em manter duas arquiteturas paralelas sem papeis claramente distintos.

## Proxima Acao Sugerida

Abrir um proximo bloco pequeno e isolado para:

1. marcar explicitamente `src/data/pipeline` como legado tecnico;
2. decidir se ele sera movido para area de arquivo/legado ou removido;
3. validar que nenhuma automacao local ou comparacao documental ainda depende dele antes da retirada.
