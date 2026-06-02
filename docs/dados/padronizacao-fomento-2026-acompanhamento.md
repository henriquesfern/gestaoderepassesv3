# Padronizacao Operacional do Fomento 2026

Este documento define o contrato operacional recomendado para as proximas atualizacoes vivas do Fomento 2026. O objetivo e reduzir risco de falha na importacao, perda de classificacoes e divergencias de acompanhamento quando os dados forem atualizados a partir de Excel ou CSV.

## Escopo

Esta padronizacao cobre apenas tres arquivos do fluxo vivo de Fomento 2026:

- `fomento_2026_base.csv`
- `fomento_2026_infrabr_validado.csv`
- `fomento_2026_acompanhamento.csv`

Os demais arquivos do app permanecem fora deste bloco e foram preservados como melhoria futura no `ROADMAP.md`.

## Regras Gerais

- Encoding obrigatorio: `UTF-8`
- Delimitador padrao: `;`
- Cabecalhos: caixa alta, sem acento e estaveis
- Datas: `YYYY-MM-DD`
- CNPJ: 14 digitos, sem mascara
- Valores monetarios: numero decimal sem `R$` e sem separador de milhar
- Arquivos devem conter cabecalho na primeira linha
- Campos textuais longos podem conter espacos e pontuacao, mas nao devem alterar o nome das colunas

## Arquivo 1: Base do Fomento 2026

### Nome recomendado

`fomento_2026_base.csv`

### Papel

Armazena os dados principais do projeto e da entidade. E a fonte base de leitura para o ciclo corrente.

### Cabecalho padrao

```csv
ENTIDADE;CNPJ;SIGLA_UF;ESTADO;SEI;FISCAL;VALOR_CONCEDENTEAJUSTADO;VALORPROJETO;CONTROLEORCAMENTO;CONTROLEPROJETO;MEDIA;VOTOS;OBJETIVO_ESTRATEGICO;OBJETIVO_COMPLETO;OBJETIVO_ESPECIFICO;AREA_ABRANGENCIA;PUBLICO_ALVO;TEXTO_NORM
```

### Campos obrigatorios

| Campo | Obrigatorio | Formato | Observacao |
| --- | --- | --- | --- |
| `ENTIDADE` | Sim | texto | Nome da entidade |
| `CNPJ` | Sim | `99999999999999` | Chave principal de relacionamento |
| `SIGLA_UF` | Sim | `SP`, `MG`, `PE` | Preferir UF oficial |
| `ESTADO` | Sim | texto | Nome por extenso da UF |
| `SEI` | Sim | texto | Identificador estavel do projeto |
| `FISCAL` | Sim | texto | Fiscal principal |
| `VALOR_CONCEDENTEAJUSTADO` | Sim | decimal | Valor do repasse |
| `VALORPROJETO` | Sim | decimal | Valor total do projeto |
| `OBJETIVO_ESTRATEGICO` | Sim | texto curto | Categoria curta usada em agregacoes |
| `OBJETIVO_COMPLETO` | Sim | texto longo | Texto principal do projeto |

### Campos recomendados

| Campo | Formato | Observacao |
| --- | --- | --- |
| `CONTROLEORCAMENTO` | decimal | Pode ser igual ao valor ajustado quando nao houver outra referencia |
| `CONTROLEPROJETO` | decimal | Controle interno do valor do projeto |
| `MEDIA` | decimal | Nota do projeto |
| `VOTOS` | inteiro | Quantidade de votos |
| `OBJETIVO_ESPECIFICO` | texto longo | Complemento do objetivo |
| `AREA_ABRANGENCIA` | texto longo | Abrangencia geografica |
| `PUBLICO_ALVO` | texto longo | Publico beneficiado |
| `TEXTO_NORM` | texto longo | Texto normalizado para classificacao |

## Arquivo 2: Classificacao validada Infra-BR

### Nome recomendado

`fomento_2026_infrabr_validado.csv`

### Papel

Armazena o enriquecimento validado de aderencia Infra-BR para o mesmo conjunto de projetos do arquivo base.

### Cabecalho padrao

```csv
CNPJ;SEI;RANKING_ADERENCIA_INFRABR_VALIDADO;SCORES_DIMENSOES_VALIDADO;RANKING_COMPONENTES_VALIDADO;SCORES_COMPONENTES_VALIDADO;RANKING_INDICADORES_VALIDADO;SCORES_INDICADORES_VALIDADO;TERMOS_DETECTADOS_VALIDADO;TERMOS_COMPONENTES_VALIDADO;TERMOS_INDICADORES_VALIDADO;DIMENSAO_1_VALIDADO;DIMENSAO_2_VALIDADO;DIMENSAO_3_VALIDADO;DIMENSAO_4_VALIDADO;DIMENSAO_5_VALIDADO;COMPONENTE_1_VALIDADO;COMPONENTE_2_VALIDADO;COMPONENTE_3_VALIDADO;COMPONENTE_4_VALIDADO;COMPONENTE_5_VALIDADO;COMPONENTE_6_VALIDADO;COMPONENTE_7_VALIDADO;INDICADOR_1_VALIDADO;INDICADOR_2_VALIDADO;INDICADOR_3_VALIDADO;INDICADOR_4_VALIDADO;INDICADOR_5_VALIDADO;INDICADOR_6_VALIDADO;INDICADOR_7_VALIDADO;INDICADOR_8_VALIDADO;INDICADOR_9_VALIDADO
```

### Campos obrigatorios

| Campo | Obrigatorio | Formato | Observacao |
| --- | --- | --- | --- |
| `CNPJ` | Sim | `99999999999999` | Chave de juncao principal |
| `SEI` | Sim | texto | Reforca identidade do projeto |

### Campos opcionais

Todos os campos de ranking, score, dimensao, componente, indicador e termos podem ficar vazios, desde que `CNPJ` e `SEI` identifiquem corretamente o projeto.

### Regras de preenchimento

- Rankings devem preservar ordem humana.
- Scores devem usar padrao `NOME:VALOR | NOME:VALOR`.
- Dimensoes, componentes e indicadores devem ser consistentes com o ranking.
- Quando um projeto nao estiver classificado, deixar os campos vazios.

## Arquivo 3: Acompanhamento do Fomento 2026

### Nome recomendado

`fomento_2026_acompanhamento.csv`

### Papel

Armazena a evolucao viva da execucao do projeto, sem alterar o cadastro estrutural do arquivo base.

### Cabecalho padrao

```csv
CNPJ;SEI;INICIO_EXECUCAO;FIM_EXECUCAO;TERMO_DE_FOMENTO;STATUS;VALOR_PRIMEIRO_REPASSE;DATA_PRIMEIRO_REPASSE;VALOR_SEGUNDO_REPASSE;DATA_SEGUNDO_REPASSE;FISCAL_SUPLENTE;SITUACAO_FINAL
```

### Campos obrigatorios

| Campo | Obrigatorio | Formato | Observacao |
| --- | --- | --- | --- |
| `CNPJ` | Sim | `99999999999999` | Chave de juncao |
| `SEI` | Sim | texto | Chave do projeto |

### Campos recomendados

| Campo | Formato | Observacao |
| --- | --- | --- |
| `INICIO_EXECUCAO` | `YYYY-MM-DD` | Inicio real ou previsto |
| `FIM_EXECUCAO` | `YYYY-MM-DD` | Fim real ou previsto |
| `TERMO_DE_FOMENTO` | texto | Ex.: `001/2026` |
| `STATUS` | texto controlado | Ex.: `Em execucao`, `Primeiro Repasse`, `Segundo Repasse`, `Em prestacao de contas`, `Finalizado` |
| `VALOR_PRIMEIRO_REPASSE` | decimal | Valor sem simbolo monetario |
| `DATA_PRIMEIRO_REPASSE` | `YYYY-MM-DD` | Data do primeiro repasse |
| `VALOR_SEGUNDO_REPASSE` | decimal | Valor sem simbolo monetario |
| `DATA_SEGUNDO_REPASSE` | `YYYY-MM-DD` | Data do segundo repasse |
| `FISCAL_SUPLENTE` | texto | Nome do suplente |
| `SITUACAO_FINAL` | texto | Encerramento ou observacao final |

## Regras de Integridade

- `CNPJ` deve existir no arquivo base.
- `SEI` deve existir no arquivo base.
- O par `CNPJ + SEI` nao deve se repetir no mesmo arquivo.
- O arquivo validado Infra-BR e o arquivo de acompanhamento nao devem criar projetos novos.
- Quando um projeto ainda nao tiver andamento, manter a linha e deixar os campos de andamento vazios.

## Modelos Operacionais

Os modelos de preenchimento desta fase estao em:

- [docs/dados/modelos/fomento_2026_base.modelo.csv](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\docs\dados\modelos\fomento_2026_base.modelo.csv)
- [docs/dados/modelos/fomento_2026_infrabr_validado.modelo.csv](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\docs\dados\modelos\fomento_2026_infrabr_validado.modelo.csv)
- [docs/dados/modelos/fomento_2026_acompanhamento.modelo.csv](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\docs\dados\modelos\fomento_2026_acompanhamento.modelo.csv)

## Fonte Operacional do Acompanhamento

Para o acompanhamento vivo do `Fomento 2026`, a fonte operacional recomendada passa a ser:

- [public/data/fomento_2026_acompanhamento.csv](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\public\data\fomento_2026_acompanhamento.csv)

Esse arquivo e o ponto de entrada para futuras atualizacoes por Excel ou CSV. O modulo [src/data/gestaofomento26.ts](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\src\data\gestaofomento26.ts) continua existindo apenas como camada de leitura do proprio CSV operacional, e nao mais como origem manual de preenchimento.

## Recomendacao Operacional

Para o acompanhamento vivo, o fluxo recomendado passa a ser:

1. Atualizar [public/data/fomento_2026_acompanhamento.csv](C:\Users\fernando.henriques\Downloads\github\gestaoderepassesv3-git\public\data\fomento_2026_acompanhamento.csv) a partir do Excel.
2. Validar o arquivo:

```bash
npm.cmd run data:validate-fomento2026-acompanhamento
```

3. Verificar a leitura direta do runtime:

```bash
npm.cmd run data:sync-fomento2026-acompanhamento
```

Esse comando agora valida o CSV operacional e confirma que nao existe mais sincronizacao manual em TypeScript.

4. Executar a checagem local do projeto:

```bash
npm.cmd run dev:check
```

O objetivo operacional desta etapa e bloquear:

- cabecalho esperado;
- CNPJ com 14 digitos;
- `SEI` obrigatorio;
- datas no padrao `YYYY-MM-DD`;
- valores numericos parseaveis;
- duplicidade de `CNPJ + SEI`.

## Validacao Automatizada

O projeto agora possui um validador operacional para esses tres arquivos:

```bash
npm.cmd run data:validate-fomento2026-inputs
```

Por padrao, o comando valida os tres arquivos-modelo desta pasta. Tambem e possivel apontar para arquivos reais exportados do Excel:

```bash
npm.cmd run data:validate-fomento2026-inputs -- --base caminho\\fomento_2026_base.csv --infra caminho\\fomento_2026_infrabr_validado.csv --acompanhamento caminho\\fomento_2026_acompanhamento.csv
```

O validador bloqueia:

- cabecalho fora da ordem esperada;
- `CNPJ` fora do padrao de 14 digitos sem mascara;
- campos obrigatorios vazios;
- datas fora do padrao `YYYY-MM-DD`;
- valores numericos preenchidos com simbolo monetario ou formato textual invalido;
- duplicidade de `CNPJ + SEI` no mesmo arquivo.

### Bootstrap inicial desta fase

Para fluxos antigos que ainda chamarem o bootstrap:

```bash
npm.cmd run data:bootstrap-fomento2026-acompanhamento
```

O comando permanece apenas como compatibilidade operacional. Se o CSV ja existir, ele valida o arquivo e informa que a fonte operacional ja esta pronta. Se o arquivo tiver sido perdido, a restauracao deve ser feita pelo Git ou por backup.
