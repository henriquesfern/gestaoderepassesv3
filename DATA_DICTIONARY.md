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

## 3. Infra-BR
- **Status**: Integrado.
- **Uso**: Cruzamento com dados municipais para medir impacto infraestrutural.
