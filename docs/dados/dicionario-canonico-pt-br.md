# Dicionario Canonico de Dados em Portugues-BR

Este documento registra o modelo canonico em Portugues-BR usado como base para a governanca de dados do projeto. A Fase 2 funcional do dominio Infra-BR foi implementada em paralelo ao runtime atual, sem substituir loaders, hooks, adapters ou componentes da UI.

## Objetivo

- Criar uma linguagem comum para os dados do projeto.
- Evitar mistura de nomes em ingles, portugues, acentos, caixa alta e variacoes de origem.
- Separar dado bruto, cadastro canonico, valores por UF e visoes de UI.
- Preservar clareza para gestores, mantenedores e futuras integracoes.

## Criticidade

- **Classificacao**: Nivel 3.
- **Motivo**: A aplicacao deste dicionario em runtime pode alterar contratos de dados usados por parsers, schemas, componentes, hooks, IA e validacoes.
- **Regra de execucao**: mudancas devem ser feitas em entregas pequenas, com validacao entre etapas e sem remocao imediata de compatibilidade legada.

## Convencoes de Nome

- Usar identificadores em Portugues-BR sem acentos para tabelas, objetos, campos e chaves.
- Usar `snake_case` para nomes canonicos.
- Preferir nomes de dominio, nao nomes tecnicos genericos.
- Preservar siglas consolidadas quando fizerem sentido, como `cnpj`, `sei`, `uf` e `infra_br`.
- Manter a identificacao visual `infra_br_*` em arquivos e normalizers que tratam fontes oriundas do Infra-BR.
- Separar cadastros de valores medidos por UF.

## Tabelas Logicas Canonicas

| Nome canonico | Papel | Origem atual principal | Observacoes |
| --- | --- | --- | --- |
| `entidades` | Cadastro consolidado de entidades | Fomento, patrocinio, CDEN, precursoras, EC Geral | Deve ter `entidade_id` derivado de `cnpj` quando possivel |
| `projetos` | Propostas, projetos ou acoes apoiadas | Fomento 2025, fomento 2026, patrocinio 2025 | Deve separar projeto de entidade |
| `repasses` | Valores, programa, ano e modalidade de apoio | Fomento e patrocinio | Deve permitir multiplos repasses por entidade/projeto |
| `programas` | Tipos e ciclos de apoio | Fomento, patrocinio | Exemplos: fomento 2026, fomento 2025, patrocinio 2025 |
| `estados` | Unidade federativa e regiao | `regions.ts`, datasets de origem | Deve unificar nome completo, `uf` e regiao |
| `fontes_dados` | Controle de origem dos arquivos | `public/data`, `src/data`, scripts | Deve registrar fonte oficial, derivado, espelho ou legado |
| `infra_estados` | Valor geral Infra-BR por UF | `infra_br_estados.csv` | Relaciona `uf`, `estado_id`, `infra_br`, `ranking` e `cor_classe` |
| `infra_dimensoes` | Cadastro de dimensoes Infra-BR | `infra_br_dimensoes.csv` | Deduplicado por `dimensao_id` |
| `infra_valores_dimensoes` | Valores por UF e dimensao Infra-BR | `infra_br_dimensoes.csv` | Relaciona `uf`, `estado_id`, `dimensao_id`, `valor`, `ranking` e `cor_classe` |
| `infra_componentes` | Cadastro de componentes Infra-BR | `infra_br_componentes.csv` | Deduplicado por `componente_id` e relacionado a `dimensao_id` |
| `infra_valores_componentes` | Valores por UF e componente Infra-BR | `infra_br_componentes.csv` | Relaciona `uf`, `estado_id`, `componente_id`, `dimensao_id`, `valor`, `ranking` e `cor_classe` |
| `infra_indicadores` | Cadastro de indicadores Infra-BR | `infra_br_detalhamento_indicadores.csv` e `infra_br_indicadores.csv` | Deduplicado por `indicador_id` e relacionado a `componente_id` |
| `infra_detalhes_indicadores` | Valores por UF e indicador Infra-BR | `infra_br_indicadores.csv` | Relaciona `uf`, `indicador_id`, `valor`, `ranking` e `cor_classe` |
| `aderencias_infra` | Relacao entre projetos e Infra-BR | Fomento 2026 enriquecido | Deve sair de campos de ranking, scores e termos detectados |

## Campos Canonicos Transversais

| Campo canonico | Tipo esperado | Origem atual comum | Observacoes |
| --- | --- | --- | --- |
| `entidade_id` | string | `cnpj` normalizado | Preferir CNPJ sem mascara quando existir |
| `nome_entidade` | string | `ENTIDADE`, `Entidade`, `Razao Social` | Nome exibivel da entidade |
| `cnpj` | string | `CNPJ` | Sempre normalizado sem pontuacao para chave |
| `sei` | string | `SEI`, `Processo SEI` | Processo administrativo |
| `programa` | string | `tipoRepasse`, origem do dataset | Exemplo: `fomento`, `patrocinio` |
| `ano` | number | nome do arquivo ou coluna | Exemplo: 2025, 2026 |
| `uf` | string | `SIGLA_UF`, `Estado`, `ESTADO`, `sigla_uf` | Sempre sigla de UF |
| `estado` | string | `Estado`, `ESTADO` | Nome completo da UF |
| `regiao` | string | `REGIAO`, `regions.ts` | Sem acento no identificador |
| `valor_repasse` | number | `VALOR_REPASSE`, `Valor de Repasse`, `Valor` | Valor concedido |
| `valor_projeto` | number | `VALORPROJETO` | Valor total do projeto quando disponivel |
| `nota` | number | `MEDIA`, `Pontuacao`, `Classificacao` | Pode exigir semantica por programa |
| `categoria` | string | `CATEGORIA`, `OBJETIVO_ESTRATEGICO`, `Tipo` | Agrupamento operacional |
| `objetivo` | string | `OBJETIVO`, `Projeto`, `objetivo` | Resumo ou objetivo principal |

## Campos Canonicos de Infra-BR

| Campo canonico | Origem atual | Observacoes |
| --- | --- | --- |
| `uf` | `sigla_uf` | Chave geografica |
| `estado_id` | `state_id` | ID numerico de estado |
| `infra_br` | `infra_br` | Nota geral da UF no Infra-BR |
| `ranking` | `rank` | Posicao no ranking |
| `cor_classe` | `color` | Classe visual normalizada como `classe_1`, `classe_2` ou `classe_3` |
| `dimensao_id` | `dimension_id` | Chave da dimensao |
| `nome_dimensao` | `dimension_name` | Nome exibivel da dimensao |
| `valor_dimensao_id` | derivado de `dimension_id` + `uf` | Chave de valor por dimensao e UF |
| `componente_id` | `component_id` | Chave do componente |
| `nome_componente` | `component_name` | Nome exibivel do componente |
| `valor_componente_id` | derivado de `component_id` + `uf` | Chave de valor por componente e UF |
| `indicador_id` | `indicator_id` ou `ID` | Chave do indicador |
| `nome_indicador` | `indicator_name` ou `INDICADOR` | Nome exibivel do indicador |
| `detalhe_indicador_id` | derivado de `indicator_id` + `uf` | Chave de valor por indicador e UF |
| `valor` | `value` | Valor da metrica |
| `descricao` | `descricao`, `DESCRICAO / CALCULO` | Descricao ou calculo |
| `fonte` | `fonte`, `FONTE` | Fonte do dado |
| `unidade` | `UNIDADE` | Unidade de medida |
| `interpretacao` | `INTERPRETACAO` | Leitura do indicador |

## Relacionamentos Canonicos

| Relacao | Chaves | Descricao |
| --- | --- | --- |
| Entidade -> Projeto | `entidade_id` ou `cnpj` | Uma entidade pode ter varios projetos |
| Projeto -> Repasse | `projeto_id`, `programa`, `ano` | Um projeto pode ter valor e ciclo de repasse |
| Projeto -> Estado | `uf` | Associacao geografica do projeto |
| Estado -> Infra-BR | `uf` | Associacao com nota geral, valores e rankings |
| Infra dimensao -> valor por UF | `dimensao_id`, `uf` | Separa cadastro da dimensao do valor medido |
| Infra dimensao -> componente | `dimensao_id` | Hierarquia Infra-BR |
| Infra componente -> valor por UF | `componente_id`, `uf` | Separa cadastro do componente do valor medido |
| Infra componente -> indicador | `componente_id` | Hierarquia Infra-BR |
| Infra indicador -> detalhe por UF | `indicador_id`, `uf` | Separa cadastro/metadados do indicador do valor medido |
| Projeto -> aderencia Infra-BR | `projeto_id`, `dimensao_id`, `componente_id`, `indicador_id` | Relacao derivada dos rankings e termos detectados |

## Estado Implementado da Fase 2 Infra-BR

A validacao `npm run data:validate-canonical-infra` confirma:

- 27 `infra_estados`.
- 6 `infra_dimensoes`.
- 162 `infra_valores_dimensoes`.
- 20 `infra_componentes`.
- 540 `infra_valores_componentes`.
- 67 `infra_indicadores`.
- 1.809 `infra_detalhes_indicadores`.

## Estrategia de Migracao Recomendada

1. Manter tipos, schemas e normalizers canonicos em paralelo aos caminhos atuais.
2. Criar um adapter de consumo do modelo canonico completo.
3. Validar equivalencia entre o adapter canonico e os dados consumidos atualmente pela UI.
4. Migrar hooks e componentes gradualmente para o adapter canonico.
5. Remover ou arquivar caminhos legados apenas apos validacao, sincronismo e decisao explicita.

## Proxima Decisao

A proxima entrega tecnica recomendada e criar um adapter de leitura do modelo canonico Infra-BR completo, sem alterar imediatamente a UI. Esse adapter deve preparar a migracao futura de hooks e componentes com compatibilidade controlada.
