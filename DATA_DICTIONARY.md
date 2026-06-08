# Dicionário de Dados - Gestão de Repasses V3

Este documento serve como a "Fonte da Verdade" para o mapeamento de colunas dos arquivos CSV brutos para a estrutura interna do aplicativo.

## 1. Entidade Selecionada (Schema Interno)

Todos os arquivos (Fomento, Patrocínio, etc.) são "achatados" para este formato:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `ENTIDADE` | String | Nome ou Razão Social da entidade beneficiária. |
| `CNPJ` | String | CNPJ formatado (14 dígitos). |
| `OBJETIVO` | String | Finalidade principal do repasse (ex: Atividade Principal). |
| `CATEGORIA` | String | Subcategoria para agrupamento (ex: Publicação, Eventos). |
| `ESTADO` | String | Nome completo do Estado (ex: São Paulo). |
| `NOTA` | Number | Média ou Pontuação obtida (0-100). |
| `VALOR_REPASSE` | Number | Valor financeiro do aporte do Confea. |
| `REGIÃO` | String | Região geográfica (Norte, Sul, etc.). |
| `tipoRepasse` | String | "Fomento" ou "Patrocínio". |

## 2. Mapeamentos Específicos

### Fomento 2026 (RelacaoFinalFomento2026.csv)
- **Origem**: Planilha de resultados 2026.
- **Campos Críticos**: `VALOR_CONCEDENTEAJUSTADO` mapeia para `VALOR_REPASSE`. `MÉDIA` mapeia para `NOTA`.

### Fomento Histórico (fomento2025.ts)
- **Origem**: Registro de 2025.
- **Campos Críticos**: `Linha` (1, 2, 3) é traduzido para nomes descritivos.

### Patrocínio Histórico (patrocinio2025.ts)
- **Origem**: Registro de 2025.
- **Campos Críticos**: `Tipo` e `TipoPublicacao` definem a `CATEGORIA`.

## 3. Cadastro Central de Entidades (entidadesCadastro.ts)

Arquivo gerado por `scripts/buildEntidadesCadastro.ts` e atualizado por `scripts/refreshEntidadesCadastro.ts`. Serve como fonte única de dados cadastrais de entidades, keyed por CNPJ.

| Campo | Tipo | Origem | Descrição |
| :--- | :--- | :--- | :--- |
| `cnpj` | String (14 dígitos) | Todos os CSVs | Chave primária. CNPJ normalizado sem formatação. |
| `razaoSocial` | String | Receita Federal | Nome oficial registrado. |
| `municipio` | String | Receita Federal | Município sede (title case). |
| `uf` | String | Receita Federal | Sigla do estado (2 letras). |
| `codigoIbge` | String? | IBGE API | Código IBGE de 7 dígitos do município. |
| `lat` | Number? | IBGE Malha | Latitude do centroide do município. |
| `lng` | Number? | IBGE Malha | Longitude do centroide do município. |
| `situacaoCadastral` | String | Receita Federal | `Ativa`, `Baixada`, `Suspensa`, `Inapta`, `Nula` ou `DESCONHECIDA`. |
| `dataInicioAtividade` | String? | Receita Federal | Data de registro/fundação (formato `YYYY-MM-DD`). |
| `atividadePrincipal` | String? | Receita Federal | Descrição do objeto social principal. |
| `email` | String? | Receita Federal | E-mail registrado na RF (quando disponível). |
| `telefone` | String? | Receita Federal | Telefone no formato `(DD) NNNNN-NNNN`. |
| `sigla` | String? | CDEN.ts / Precursoras.ts | Sigla oficial da entidade. |
| `fundacao` | String? | Precursoras.ts | Ano de fundação (entidades históricas). |
| `isCDEN` | Boolean | CDEN.ts | `true` se entidade é do Conselho de Entidades Nacionais. |
| `isPrecursora` | Boolean | Precursoras.ts | `true` se entidade é uma das 44 precursoras históricas. |
| `fonteLocalizacao` | String | Script | `RF` (Receita Federal), `Gemini` (fallback IA) ou `Indeterminado`. |

**Estado atual (08/06/2026):** 333 entidades; 16 com situação `Ativa`; 26 CDEN; 44 Precursoras.

**Fontes de CNPJ coletadas:** fomento2026.csv, fomento2025.csv, patrocinio2025.csv, cden.ts, precursoras.ts.

**Pendente:** integração dos 968 registros do ECGeral.ts (sem CNPJ) — ver Fase 4 no ROADMAP.md.

## 4. Localização de Entidades (entidadesLocalizacao.ts)

Arquivo parcialmente redundante com `entidadesCadastro.ts`. Mantido enquanto os adapters ainda o utilizam como fonte de `CIDADE` e `CIDADE_UF`. Será descontinuado após a Fase 5 do ROADMAP.md.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `cnpj` | String (14 dígitos) | Chave primária. |
| `entidade` | String | Nome da entidade. |
| `cidade` | String | Município sede. |
| `uf` | String | Sigla do estado. |
| `cidade_uf` | String | Formato `Cidade/UF`. |
| `confianca` | String | `Alta` ou `Média`. |
| `codigoIbge` | String? | Código IBGE (quando disponível). |

## 5. Infra-BR
- **Status**: Integrado.
- **Uso**: Cruzamento com dados municipais para medir impacto infraestrutural.
