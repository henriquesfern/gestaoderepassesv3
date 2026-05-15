# Dicionário Canônico de Dados em Português-BR

Este documento registra a proposta inicial da Fase 2 da governança de dados: padronizar entidades, tabelas lógicas, campos e relacionamentos com identificadores em Português-BR.

## Objetivo

- Criar uma linguagem comum para os dados do projeto.
- Evitar mistura de nomes em inglês, português, acentos, caixa alta e variações de origem.
- Preparar uma camada canônica antes de qualquer alteração estrutural em adapters, schemas, hooks ou componentes.
- Preservar clareza para gestores, mantenedores e futuras integrações.

## Criticidade

- **Classificação**: Nível 3.
- **Motivo**: A aplicação deste dicionário em código pode alterar contratos de dados usados por parsers, schemas, componentes, hooks, IA e validações.
- **Regra de execução**: este documento é planejamento. A implementação em runtime deve ser feita em entregas pequenas, com confirmação explícita, validação entre etapas e sem remoção imediata de compatibilidade legada.

## Convenções de Nome

- Usar identificadores em Português-BR sem acentos para tabelas, objetos, campos e chaves.
- Usar `snake_case` para nomes canônicos.
- Preferir nomes de domínio, não nomes técnicos genéricos.
- Preservar siglas consolidadas quando fizerem sentido, como `cnpj`, `sei`, `uf`, `infra_br`.
- Evitar abreviações ambíguas.
- Separar dado bruto, dado canônico e visão de UI.

## Tabelas Lógicas Canônicas

| Nome canônico | Papel | Origem atual principal | Observações |
| --- | --- | --- | --- |
| `entidades` | Cadastro consolidado de entidades | Fomento, patrocínio, CDEN, precursoras, EC Geral | Deve ter `entidade_id` derivado de `cnpj` quando possível |
| `projetos` | Propostas, projetos ou ações apoiadas | Fomento 2025, fomento 2026, patrocínio 2025 | Deve separar projeto de entidade |
| `repasses` | Valores, programa, ano e modalidade de apoio | Fomento e patrocínio | Deve permitir múltiplos repasses por entidade/projeto |
| `programas` | Tipos e ciclos de apoio | Fomento, patrocínio | Exemplos: fomento 2026, fomento 2025, patrocínio 2025 |
| `estados` | Unidade federativa e região | `regions.ts`, datasets de origem | Deve unificar nome completo, `uf` e região |
| `fontes_dados` | Controle de origem dos arquivos | `public/data`, `src/data`, scripts | Deve registrar fonte oficial, derivado, espelho ou legado |
| `infra_estados` | Nota Infra-BR por UF | `infra-br.csv` | Relaciona `uf` e `state_id` |
| `infra_dimensoes` | Notas por dimensão Infra-BR | `dimensoes_0100.csv` | Relaciona `uf` e `dimensao_id` |
| `infra_componentes` | Notas por componente Infra-BR | `componentes_0100.csv` | Relaciona `componente_id` e `dimensao_id` |
| `infra_indicadores` | Indicadores Infra-BR por UF | `indicadores_0100.csv` | Relaciona `indicador_id`, `componente_id` e `dimensao_id` |
| `infra_detalhes_indicadores` | Metadados dos indicadores | `detalhamentoindicadores.csv` | Inclui cálculo, unidade e interpretação |
| `aderencias_infra` | Relação entre projetos e Infra-BR | Fomento 2026 enriquecido | Deve sair de campos de ranking, scores e termos detectados |

## Campos Canônicos Transversais

| Campo canônico | Tipo esperado | Origem atual comum | Observações |
| --- | --- | --- | --- |
| `entidade_id` | string | `cnpj` normalizado | Preferir CNPJ sem máscara quando existir |
| `nome_entidade` | string | `ENTIDADE`, `Entidade`, `Razão Social` | Nome exibível da entidade |
| `cnpj` | string | `CNPJ` | Sempre normalizado sem pontuação para chave |
| `sei` | string | `SEI`, `Processo SEI` | Processo administrativo |
| `programa` | string | `tipoRepasse`, origem do dataset | Exemplo: `fomento`, `patrocinio` |
| `ano` | number | nome do arquivo ou coluna | Exemplo: 2025, 2026 |
| `uf` | string | `SIGLA_UF`, `Estado`, `ESTADO`, `sigla_uf` | Sempre sigla de UF |
| `estado` | string | `Estado`, `ESTADO` | Nome completo da UF |
| `regiao` | string | `REGIÃO`, `regions.ts` | Sem acento no identificador |
| `valor_repasse` | number | `VALOR_REPASSE`, `Valor de Repasse`, `Valor`, `VALOR_CONCEDENTEAJUSTADO` | Valor concedido |
| `valor_projeto` | number | `VALORPROJETO` | Valor total do projeto quando disponível |
| `nota` | number | `MÉDIA`, `Pontuação`, `Classificação` | Pode exigir semântica por programa |
| `categoria` | string | `CATEGORIA`, `OBJETIVO_ESTRATEGICO`, `Tipo` | Agrupamento operacional |
| `objetivo` | string | `OBJETIVO`, `Projeto`, `objetivo` | Resumo ou objetivo principal |
| `fiscal` | string | `FISCAL`, `Fiscal` | Fiscal titular |
| `fiscal_suplente` | string | `Fiscal Suplente`, gestão 2026 | Fiscal suplente |
| `data_inicio` | string | `DATA INÍCIO`, `Data Início`, gestão 2026 | Futuramente pode virar data ISO |
| `data_fim` | string | `DATA FIM`, `Data Fim`, gestão 2026 | Futuramente pode virar data ISO |

## Campos Canônicos de Projetos de Fomento 2026

| Campo canônico | Origem atual | Observações |
| --- | --- | --- |
| `objetivo_completo` | `OBJETIVO_COMPLETO`, `objetivo` | Texto detalhado |
| `area_abrangencia` | `AREA_ABRANGENCIA`, `area_abrangencia` | Área ou território |
| `objetivo_especifico` | `OBJETIVO_ESPECIFICO`, `objetivo_específico` | Texto específico |
| `publico_alvo` | `PUBLICO_ALVO`, `publico_alvo` | Beneficiários |
| `objetivo_estrategico` | `OBJETIVO_ESTRATEGICO`, `objetivo_estrategivo` | Padronizar grafia para `estrategico` |
| `texto_normalizado` | `TEXTO_NORM`, `texto_norm` | Texto usado para IA/classificação |
| `termo_fomento` | gestão 2026 | Contrato/termo associado |
| `status_execucao` | gestão 2026 | Situação de execução |

## Campos Canônicos de Infra-BR

| Campo canônico | Origem atual | Observações |
| --- | --- | --- |
| `uf` | `sigla_uf` | Chave geográfica |
| `estado_id` | `state_id` | ID numérico de estado |
| `infra_br` | `infra_br` | Nota geral |
| `ranking` | `rank` | Posição no ranking |
| `cor_classe` | `color` | Classe visual |
| `dimensao_id` | `dimension_id` | Chave da dimensão |
| `nome_dimensao` | `dimension_name` | Nome exibível |
| `componente_id` | `component_id` | Chave do componente |
| `nome_componente` | `component_name` | Nome exibível |
| `indicador_id` | `indicator_id` | Chave do indicador |
| `nome_indicador` | `indicator_name` | Nome exibível |
| `valor` | `value` | Valor da métrica |
| `descricao` | `descricao`, `DESCRIÇÃO / CÁLCULO` | Descrição ou cálculo |
| `fonte` | `fonte`, `FONTE` | Fonte do dado |
| `unidade` | `UNIDADE` | Unidade de medida |
| `interpretacao` | `INTERPRETAÇÃO` | Leitura do indicador |

## Relacionamentos Canônicos

| Relação | Chaves | Descrição |
| --- | --- | --- |
| Entidade -> Projeto | `entidade_id` ou `cnpj` | Uma entidade pode ter vários projetos |
| Projeto -> Repasse | `projeto_id`, `programa`, `ano` | Um projeto pode ter valor e ciclo de repasse |
| Projeto -> Estado | `uf` | Associação geográfica do projeto |
| Estado -> Infra-BR | `uf` | Associação com notas gerais e rankings |
| Infra dimensão -> componente | `dimensao_id` | Hierarquia Infra-BR |
| Infra componente -> indicador | `componente_id` | Hierarquia Infra-BR |
| Projeto -> aderência Infra-BR | `projeto_id`, `dimensao_id`, `componente_id`, `indicador_id` | Relação derivada dos rankings e termos detectados |

## Estratégia de Migração Recomendada

1. Criar tipos canônicos em paralelo aos tipos atuais, sem substituir `EntidadeSelecionada` imediatamente.
2. Criar funções de normalização por domínio em módulos isolados.
3. Gerar uma estrutura canônica em memória a partir dos CSVs atuais.
4. Validar contagens e totais contra a estrutura atual.
5. Criar adapters de compatibilidade para manter a UI funcionando.
6. Migrar hooks e componentes gradualmente para o modelo canônico.
7. Remover ou arquivar caminhos legados apenas após validação e sincronismo.

## Validações Necessárias

- Contagem de linhas por dataset.
- Unicidade de `cnpj` por domínio quando aplicável.
- Presença de `uf` válida nos dados geográficos.
- Integridade da hierarquia `dimensao_id` -> `componente_id` -> `indicador_id`.
- Totais financeiros antes e depois da normalização.
- Amostragem de entidades com múltiplas participações em fomento e patrocínio.
- Compatibilidade da IA com os nomes canônicos em Português-BR.

## Próxima Decisão

Antes de aplicar este dicionário no código, deve ser escolhida uma primeira entrega técnica pequena. A recomendação inicial é criar apenas os tipos canônicos e validadores de apoio, sem alterar o consumo da UI.
