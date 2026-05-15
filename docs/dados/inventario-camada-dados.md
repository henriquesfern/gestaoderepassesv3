# Inventário da Camada de Dados

Este documento registra a Fase 0 e a Fase 1 da governança de dados do projeto: inventário inicial dos datasets, consumidores principais, chaves de relacionamento e proposta de fonte oficial.

## Objetivo

- Reduzir ambiguidade entre arquivos brutos, arquivos derivados e dados consumidos pelo app.
- Preparar a futura normalização canônica dos dados sem alterar comportamento em produção.
- Preservar rastreabilidade para Infra-BR, fomento, patrocínio, entidades e bases auxiliares.

## Escopo Avaliado

- `public/data`: CSVs carregados em runtime pelo app.
- `src/data`: adapters, schemas, loaders, arquivos CSV de origem/espelho e arquivos TypeScript com dados embutidos.
- `src/types` e `src/types/infra.ts`: contratos TypeScript consumidos pelo app.
- `scripts/export-static-data.ts` e `scripts/validateData.ts`: exportação e validação estrutural.

## Estado Atual

O app consome os principais datasets por meio de `src/data/parser.ts`, que carrega CSVs de `public/data` com `fetchStaticText`.

Também existem arquivos grandes em `src/data/*.ts` que embutem CSVs ou arrays. Eles ainda aparecem em scripts e em caminhos legados, mas não são a principal fonte runtime do app para os dados centrais já exportados em `public/data`.

Há ainda uma pasta `src/data/pipeline`, que representa um pipeline anterior/paralelo. Ela deve ser tratada como candidata a revisão antes de qualquer remoção.

## Fontes Oficiais Propostas

| Domínio | Fonte oficial proposta | Arquivos derivados ou auxiliares | Chave principal sugerida |
| --- | --- | --- | --- |
| Fomento corrente 2026 | `public/data/fomento2026.csv` | `src/data/fomento2026.ts`, `src/data/newFomentoData.ts`, `public/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv` | `cnpj`, `sei`, `ano`, `programa` |
| Gestão do fomento 2026 | `public/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv` | `src/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv`, `src/data/gestaofomento26.ts` | `cnpj`, `sei` |
| Fomento histórico 2025 | `public/data/fomento2025.csv` | `src/data/fomento2025.ts` | `cnpj`, `sei`, `ano`, `programa` |
| Patrocínio histórico 2025 | `public/data/patrocinio2025.csv` | `src/data/patrocinio2025.ts` | `cnpj`, `sei`, `ano`, `programa` |
| Entidades CDEN | `src/data/cden.ts` | Nenhum espelho identificado | `cnpj` |
| Entidades precursoras | `src/data/precursoras.ts` | Nenhum espelho identificado | `cnpj` |
| EC Geral | `src/data/ECGeral.ts` | Nenhum espelho identificado | `cnpj`, nome normalizado |
| Infra-BR estados | `public/data/infra_br_estados.csv` | `src/data/infra_br_estados.csv`, `src/data/infra_br_estados.ts` | `uf`, `state_id` |
| Infra-BR médias nacionais | `public/data/infra_br_medias_brasil.csv` | `src/data/infra_br_medias_brasil.csv`, `src/data/infra_br_medias_brasil.ts` | `dimensao` |
| Infra-BR dimensões | `public/data/infra_br_dimensoes.csv` | `src/data/infra_br_dimensoes.csv`, `src/data/infra_br_dimensoes.ts` | `uf`, `dimension_id` |
| Infra-BR componentes | `public/data/infra_br_componentes.csv` | `src/data/infra_br_componentes.csv`, `src/data/infra_br_componentes.ts` | `uf`, `component_id`, `dimension_id` |
| Infra-BR indicadores | `public/data/infra_br_indicadores.csv` | `src/data/infra_br_indicadores.csv`, `src/data/infra_br_indicadores.ts` | `uf`, `indicator_id`, `component_id`, `dimension_id`, `ano` |
| Infra-BR detalhamento de indicadores | `public/data/infra_br_detalhamento_indicadores.csv` | `src/data/infra_br_detalhamento_indicadores.csv`, `src/data/infra_br_detalhamento_indicadores.ts` | `id`, `indicador`, `ano` |

## Consumidores Principais

- `src/context/DataContext.tsx`: inicializa a carga global dos dados.
- `src/data/parser.ts`: orquestra leitura de CSVs e adaptação para o app.
- `src/data/adapters.ts`: transforma fomento e patrocínio para `EntidadeSelecionada`.
- `src/data/runtime-loaders.ts`: carrega e transforma dados Infra-BR em runtime.
- `src/hooks/useOverviewMetrics.ts`: cruza repasses, estados e Infra-BR.
- `src/hooks/useInfraBRMetrics.ts`: calcula métricas de aderência e comparação Infra-BR.
- `src/hooks/useDirectoryECGeral.ts`: cruza EC Geral com fomento, patrocínio, CDEN e precursoras.
- `src/components/AIAssistant.tsx`: monta contexto resumido para consultas.

## Relações Atuais

- `cnpj`: principal vínculo entre entidades, fomento, patrocínio, CDEN, precursoras e EC Geral.
- `sei`: vínculo operacional de processos e projetos.
- `estado` / `uf`: vínculo geográfico com regiões, mapas e Infra-BR.
- `dimension_id`, `component_id`, `indicator_id`: hierarquia Infra-BR.
- `ano` e `tipoRepasse`: separação temporal e programática.

## Problemas Identificados

- Há duplicidade entre CSVs em `src/data` e `public/data`.
- Há arquivos TypeScript grandes com dados embutidos que podem confundir a fonte oficial.
- O app combina nomes de coluna em formatos diferentes, como `ESTADO`, `Estado`, `SIGLA_UF`, `REGIÃO`, `MÉDIA`, `Pontuação` e `Valor de Repasse`.
- Alguns campos exigem compatibilidade com acentuação e encoding, especialmente em datasets Infra-BR e detalhamento.
- A pasta `src/data/pipeline` parece não representar o caminho runtime principal atual.
- Os relacionamentos existem, mas ainda estão implícitos em adapters e hooks.

## Diretriz Para a Fase 2

A Fase 2 deve propor um modelo canônico com identificadores em Português-BR.

Exemplos preferenciais:

- `entidades`, não `entities`.
- `projetos`, não `projects`.
- `repasses`, não `grants`.
- `infra_componentes`, não `infra_components`.
- `infra_indicadores`, não `infra_indicators`.
- `infra_dimensoes`, não `infra_dimensions`.
- `programas`, `estados`, `regioes`, `fontes_dados`.

O modelo canônico deve preservar o domínio brasileiro do projeto e facilitar leitura por gestores e futuros mantenedores.

## Próximos Passos Recomendados

1. Confirmar as fontes oficiais propostas neste documento.
2. Marcar explicitamente quais arquivos são fonte, espelho, derivado ou legado.
3. Criar um dicionário canônico em Português-BR para a Fase 2.
4. Planejar a normalização sem remover arquivos legados no primeiro movimento.
5. Ampliar `scripts/validateData.ts` para validar chaves, duplicidades e relacionamentos, não apenas formato estrutural.
