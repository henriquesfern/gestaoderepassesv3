# Inventario Fase 0 - Dados Vivos de Entidades e Projetos

## Objetivo

Este documento registra a Fase 0 da frente de governanca de dados vivos de entidades e projetos. O foco e consolidar fontes, campos, chaves e destino conceitual antes de qualquer alteracao de runtime, parser, schema ou UI.

Esta fase e documental. A implementacao estrutural futura continua classificada como criticidade Nivel 3.

## Fontes Inventariadas

| Fonte | Linhas | Papel atual | Observacao |
| --- | ---: | --- | --- |
| `public/data/fomento2026.csv` | 107 | Base principal do Fomento 2026 | Contem entidade, CNPJ, UF, valores, fiscal, SEI, objetivos e classificacao Infra-BR preliminar. |
| `public/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv` | 107 | Complemento validado do Fomento 2026 | Usa `;` como delimitador e complementa ranking, scores, componentes, indicadores e termos Infra-BR. |
| `src/data/gestaofomento26.ts` | 107 | Acompanhamento operacional manual do Fomento 2026 | Relaciona por CNPJ normalizado e adiciona execucao, termo, repasses, fiscal suplente e situacao final. |
| `public/data/fomento2025.csv` | 123 | Historico de Fomento 2025 | Contem entidade, CNPJ, valor, classificacao, linha solicitada, datas e processo SEI. |
| `public/data/patrocinio2025.csv` | 223 | Historico de Patrocinio 2025 | Contem campos especificos de acao/evento/publicacao, periodo, fiscalizacao e SEI. |
| `src/data/cden.ts` | 26 | Grupo institucional CDEN | Relacao simples por entidade e CNPJ. |
| `src/data/precursoras.ts` | 45 | Grupo institucional de precursoras | Relacao por CNPJ, entidade, sigla, Crea e ano de fundacao. |
| `src/data/ECGeral.ts` | ampla | Cadastro institucional geral | Relacao historica por processo, origem, tipo, sigla, denominacao, decisao, situacao e observacao. |

## Diagnostico de Chaves

| Fonte | Chave disponivel | Resultado observado | Uso recomendado |
| --- | --- | --- | --- |
| Fomento 2026 base | `CNPJ`, `SEI` | 107 CNPJs unicos e 107 SEIs unicos | Usar `CNPJ` para entidade e `tipo + ciclo + SEI` para projeto quando `SEI` existir. |
| Fomento 2026 validado | `CNPJ`, `SEI` | 107 CNPJs unicos e 107 SEIs unicos | Complementar a base por `CNPJ` normalizado e validar divergencias de `SEI`. |
| Gestao Fomento 2026 | `cnpj` | 107 CNPJs esperados | Relacionar por `cnpj_normalizado` ate existir `projeto_id` explicito. |
| Fomento 2025 | `CNPJ`, `Processo SEI` | 123 CNPJs unicos e 123 processos unicos | Usar `tipo + ciclo + processo_sei` para projeto historico. |
| Patrocinio 2025 | `CNPJ`, `SEI` | 223 CNPJs unicos e 223 SEIs unicos | Usar `tipo + ciclo + SEI` para projeto/acao historica. |
| CDEN | `CNPJ` | Relacao institucional | Normalizar CNPJ e gravar como grupo da entidade. |
| Precursoras | `CNPJ` | Relacao institucional | Normalizar CNPJ e gravar como grupo da entidade, preservando sigla, Crea e fundacao. |
| EC Geral | `processo`, `sigla`, `denominacao` | Cadastro historico sem CNPJ explicito | Usar como referencia auxiliar; exige estrategia propria de conciliacao antes de virar cadastro mestre. |

## Campos por Fonte

### Fomento 2026 - Base

Campos identificados:

- `ENTIDADE`
- `CNPJ`
- `ESTADO`
- `MEDIA`
- `VOTOS`
- `VALOR_CONCEDENTEAJUSTADO`
- `CONTROLEORCAMENTO`
- `VALORPROJETO`
- `CONTROLEPROJETO`
- `REGIAO`
- `OBJETIVO_COMPLETO`
- `AREA_ABRANGENCIA`
- `OBJETIVO_ESPECIFICO`
- `PUBLICO_ALVO`
- `OBJETIVO_ESTRATEGICO`
- `SIGLA_UF`
- `FISCAL`
- `SEI`
- `TEXTO_NORM`
- `RANKING_ADERENCIA_INFRABR`
- `SCORES`
- `DIMENSAO_PRINCIPAL`
- `TERMOS_DETECTADOS`
- `DIMENSAO_1` a `DIMENSAO_5`

Destino conceitual:

- `entidades`: `CNPJ`, `ENTIDADE`, `ESTADO`, `SIGLA_UF`.
- `projetos_base`: `SEI`, `tipo_projeto`, `ciclo`, `valor_repasse`, `valor_projeto`, `fiscal`, `nota`, `fonte_arquivo`.
- `projetos_fomento`: objetivos, area de abrangencia, publico-alvo, texto normativo e aderencia Infra-BR.
- `classificacoes_infrabr_projeto`: rankings, scores, dimensoes e termos.

### Fomento 2026 - Complemento Validado

Campos identificados:

- `ENTIDADE`
- `CNPJ`
- `objetivo`
- `area_abrangencia`
- `objetivo_especifico`
- `publico_alvo`
- `objetivo_estrategivo`
- `sigla_uf`
- `NOTA MEDIA`
- `VALOR CONCEDENTE`
- `FISCAL`
- `SEI`
- `texto_norm`
- `Ranking_Aderencia_InfraBR_M3_3_VALIDADO`
- `Scores_Dimensoes_M3_3_VALIDADO`
- `Ranking_Componentes_M3_3_VALIDADO`
- `Scores_Componentes_M3_3_VALIDADO`
- `Ranking_Indicadores_M3_3_VALIDADO`
- `Scores_Indicadores_M3_3_VALIDADO`
- `Termos_Detectados_M3_3_VALIDADO`
- `Termos_Componentes_M3_3_VALIDADO`
- `Termos_Indicadores_M3_3_VALIDADO`
- `Dimensao_1_M3_3_VALIDADO` a `Dimensao_5_M3_3_VALIDADO`
- `Componente_1_M3_3_VALIDADO` a `Componente_7_M3_3_VALIDADO`
- `Indicador_1_M3_3_VALIDADO` a `Indicador_9_M3_3_VALIDADO`

Destino conceitual:

- `projetos_fomento`: campos textuais validados quando forem mais confiaveis que a base.
- `classificacoes_infrabr_projeto`: dimensoes, componentes, indicadores, scores e termos validados.

### Gestao Fomento 2026

Campos identificados:

- `cnpj`
- `inicioexecucao`
- `fimexecucao`
- `termodefomento`
- `status`
- `primeirorepasse`
- `dataprimeirorepasse`
- `segundorepasse`
- `datasegundorepasse`
- `fiscalsuplente`
- `situacaofinal`

Destino conceitual:

- `acompanhamento_projetos`: status, datas de execucao, termo, repasses e situacao final.
- `projetos_base`: `fiscal_suplente`, quando o campo representar dado estrutural do projeto e nao evento de acompanhamento.

### Fomento 2025

Campos identificados:

- `Estado`
- `Cidade`
- `CNPJ`
- `Sigla`
- `Razao Social`
- `Resultado 2a FASE`
- `Linha Solicitada`
- `Valor`
- `Classificacao`
- `DATA INICIO`
- `DATA FIM`
- `Processo SEI`

Destino conceitual:

- `entidades`: `CNPJ`, `Sigla`, `Razao Social`, `Estado`, `Cidade`.
- `projetos_base`: `tipo_projeto`, `ciclo`, `Processo SEI`, `valor_repasse`, `nota`, datas e snapshot da entidade.
- `projetos_fomento`: `Linha Solicitada` e classificacao do ciclo historico.

### Patrocinio 2025

Campos identificados:

- `Estado`
- `CNPJ`
- `Entidade`
- `Valor de Repasse`
- `Pontuacao`
- `Tipo`
- `Data Inicio`
- `Data Fim`
- `TipoPublicacao`
- `Mes`
- `SEI`
- `Projeto`
- `Cidade`
- `Local Entidade`
- `Fiscal`
- `Fiscal Suplente`
- `Fiscal Crea`

Destino conceitual:

- `entidades`: `CNPJ`, `Entidade`, `Estado`, `Cidade`, `Local Entidade`.
- `projetos_base`: `tipo_projeto`, `ciclo`, `SEI`, `valor_repasse`, `nota`, fiscais e datas.
- `projetos_patrocinio`: `Tipo`, `TipoPublicacao`, `Mes`, `Projeto`, `Cidade` e dados de localizacao/realizacao.

### CDEN

Campos identificados:

- `Entidade`
- `CNPJ`

Destino conceitual:

- `grupos_entidade`: grupo `CDEN` por CNPJ normalizado.
- `entidades`: complemento de nome quando a entidade nao existir em outra fonte.

### Precursoras

Campos identificados:

- `CNPJ`
- `Entidade`
- `Sigla`
- `Crea`
- `Fundacao`

Destino conceitual:

- `grupos_entidade`: grupo `Precursora` por CNPJ normalizado.
- `entidades`: complemento de sigla e nome quando a entidade nao existir em outra fonte.
- `tabelas_auxiliares`: ano de fundacao e Crea de referencia.

### EC Geral

Campos identificados:

- `ano`
- `processo`
- `origem`
- `assunto`
- `tipo`
- `sigla`
- `denominacao`
- `decisao`
- `situacao`
- `observacao`

Destino conceitual:

- `entidades_referencia`: cadastro institucional auxiliar.
- `tabelas_auxiliares`: situacao de registro, origem, tipo institucional e decisoes.

Observacao: por nao possuir CNPJ explicito, esta fonte nao deve ser usada automaticamente como cadastro mestre sem uma etapa futura de conciliacao.

## Matriz Origem/Destino

| Destino alvo | Fontes primarias | Fontes complementares | Observacao |
| --- | --- | --- | --- |
| `entidades` | Fomento 2026, Fomento 2025, Patrocinio 2025 | CDEN, Precursoras, EC Geral | Cadastro mestre por `cnpj_normalizado`; EC Geral exige conciliacao separada. |
| `projetos_base` | Fomento 2026, Fomento 2025, Patrocinio 2025 | Gestao Fomento 2026 | Campos comuns: tipo, ciclo, entidade, SEI/processo, valores, nota, fiscais, datas e status geral. |
| `projetos_fomento` | Fomento 2026, Fomento 2025 | Complemento validado Fomento 2026 | Campos especificos de objetivos, linhas, publico, abrangencia e aderencia Infra-BR. |
| `projetos_patrocinio` | Patrocinio 2025 | futuras bases Patrocinio 2026/2027 | Campos especificos de tipo, publicacao, evento/projeto, mes, cidade, local e contrapartidas futuras. |
| `acompanhamento_projetos` | Gestao Fomento 2026 | futuras planilhas vivas de acompanhamento | Eventos e estado de execucao devem ser versionaveis por data de atualizacao. |
| `classificacoes_infrabr_projeto` | Complemento validado Fomento 2026 | Fomento 2026 base | Preserva dimensoes, componentes, indicadores, scores e termos por projeto. |
| `grupos_entidade` | CDEN, Precursoras | Fomento/Patrocinio quando houver flags | Evita misturar classificacao institucional no cadastro basico. |
| `tabelas_auxiliares` | Regions, status, ciclos, EC Geral | regras atuais de UI | Centraliza listas controladas e evita regras espalhadas no codigo. |

## Proposta de Chaves Canonicas

### `cnpj_normalizado`

- Regra: remover todos os caracteres nao numericos.
- Tamanho esperado: 14 digitos.
- Uso: chave principal de entidade e chave de relacionamento para projetos, CDEN, precursoras e acompanhamento legado.
- Validacao minima: nao vazio para projetos de Fomento e Patrocinio.

### `projeto_id`

Regra recomendada inicial:

```text
{tipo_projeto}:{ciclo}:{identificador_processo}
```

Exemplos:

- `fomento:2026:SEI_NORMALIZADO`
- `fomento:2025:PROCESSO_SEI_NORMALIZADO`
- `patrocinio:2025:SEI_NORMALIZADO`

Fallback apenas quando nao houver processo/SEI:

```text
{tipo_projeto}:{ciclo}:{cnpj_normalizado}:{indice_origem}
```

O fallback deve gerar alerta de qualidade, pois e menos estavel.

### `ciclo`

- Formato recomendado: ano ou intervalo legivel, por exemplo `2026`, `2025`, `2026-2027`.
- Deve ser explicito em todos os projetos, nunca inferido apenas pelo nome do arquivo.

### `tipo_projeto`

Valores iniciais:

- `fomento`
- `patrocinio`

Regra: controla qual tabela especifica e obrigatoria. Projeto `fomento` exige linha em `projetos_fomento`; projeto `patrocinio` exige linha em `projetos_patrocinio`.

### `fonte_arquivo`

- Deve registrar o arquivo de origem usado na importacao.
- Para dados combinados, manter origem primaria e fontes complementares em campos separados ou em log de importacao.

## Politica de Snapshot

Projetos devem guardar snapshot de dados basicos da entidade no momento do ciclo:

- `nome_entidade_snapshot`
- `sigla_snapshot`
- `uf_snapshot`
- `cidade_snapshot`

Motivo: a entidade pode mudar nome, sigla, cidade ou informacao cadastral ao longo do tempo, mas o projeto historico deve continuar reproduzindo o contexto do ciclo em que foi aprovado.

O cadastro `entidades` deve guardar a melhor versao atual conhecida, enquanto `projetos_base` guarda o snapshot do ciclo.

## Regras de Qualidade para a Proxima Fase

- Todo projeto deve ter `tipo_projeto`, `ciclo`, `cnpj_normalizado` e `projeto_id`.
- Todo `projeto_id` deve ser unico.
- Todo projeto deve apontar para uma entidade existente ou gerar alerta de entidade nova.
- Acompanhamento deve apontar para `projeto_id`; enquanto isso nao existir, pode relacionar por `cnpj_normalizado` somente como transicao.
- Fomento e Patrocinio nao devem compartilhar campos especificos na mesma tabela.
- Campos de valores devem ser normalizados para numero.
- Campos de datas devem usar formato ISO `YYYY-MM-DD` quando possivel.
- Arquivos vivos devem gerar relatorio de diferencas antes de alterar dados consumidos pelo app.

## Contrato Minimo para Schemas Futuros

Antes de implementar normalizers, criar schemas para:

- `entidadeSchema`
- `projetoBaseSchema`
- `projetoFomentoSchema`
- `projetoPatrocinioSchema`
- `acompanhamentoProjetoSchema`
- `classificacaoInfraBRProjetoSchema`
- `grupoEntidadeSchema`
- `cicloSchema`

Esses schemas devem rodar em paralelo ao fluxo atual e produzir relatorio de validacao, sem substituir `EntidadeSelecionada` no primeiro bloco de implementacao.

## Decisoes Encaminhadas

- Modelo alvo deve ser hibrido, com base comum de projetos e tabelas especificas por tipo.
- `CNPJ` normalizado deve ser a identidade central de entidade.
- `projeto_id` deve priorizar `tipo + ciclo + SEI/processo`.
- Dados de acompanhamento devem ficar separados dos dados estruturantes do projeto.
- EC Geral deve entrar como referencia auxiliar ate haver reconciliacao por CNPJ ou regra confiavel de conciliacao.

## Pendencias para Decisao Antes da Fase 1

- Definir se a saida canonica sera JSON, CSV ou ambos.
- Definir pasta oficial para arquivos vivos de entrada.
- Definir se dados bancarios ficarao fora do app ou em camada restrita.
- Definir como registrar historico de alteracoes das planilhas vivas.
- Definir se a primeira implementacao normalizara apenas Fomento 2026 ou tambem historicos 2025.

## Proxima Acao Recomendada

Executar um bloco pequeno de Fase 1 paralela: criar schemas Zod e normalizers iniciais somente para `entidades` e `projetos_base`, sem trocar o runtime atual e com validacao de contagem, duplicidade de chaves e integridade de relacionamento.
