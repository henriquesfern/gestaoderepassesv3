# Governanca de Dados Vivos de Entidades e Projetos

## Objetivo

Este documento registra a avaliacao inicial para evoluir a camada de dados de entidades, projetos e acompanhamento do app, preservando a entrada gratuita por arquivos CSV, XLSX ou TXT e preparando o projeto para ciclos vivos como Fomento 2026 e futuros ciclos de Patrocinio 2026/2027.

A frente completa e de criticidade Nivel 3, pois podera alterar a base de dados do app, tipos, parsers, validadores e consumidores. Este documento e apenas o Bloco 1 de inventario e desenho, sem mudanca de runtime.

## Situacao Atual

Hoje o app monta a visao de uso a partir de arquivos distintos e adapta tudo para `EntidadeSelecionada`, que mistura dados cadastrais, dados do projeto, dados financeiros, flags institucionais, acompanhamento e classificacoes derivadas.

Arquivos e fontes principais identificados:

- `public/data/fomento2026.csv`: base atual do Fomento 2026, com entidade, CNPJ, valores, objetivo, area de abrangencia, publico-alvo, fiscal, SEI e classificacoes Infra-BR.
- `public/data/GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv`: complemento validado de Fomento 2026, principalmente aderencia Infra-BR e campos classificados.
- `src/data/gestaofomento26.ts`: acompanhamento manual do Fomento 2026, com inicio/fim de execucao, termo, status, repasses, fiscal suplente e situacao final.
- `public/data/fomento2025.csv`: historico do Fomento 2025.
- `public/data/patrocinio2025.csv`: historico do Patrocinio 2025.
- `src/data/cden.ts`: relacao de entidades CDEN.
- `src/data/precursoras.ts`: relacao de entidades precursoras.
- `src/data/ECGeral.ts`: relacao ampla de entidades e contexto institucional geral.
- `src/data/parser.ts`: parser runtime principal usado pelo `DataContext`.
- `src/data/adapters.ts`: adapters que convertem linhas brutas em `EntidadeSelecionada`.
- `src/data/pipeline/*`: pipeline embrionaria `ingest -> transform -> buildAppData`, ainda paralela ao parser runtime principal.
- `scripts/validateData.ts` e `src/data/schema.ts`: validacao estrutural com Zod sobre a visao final do app.

## Chaves de Relacionamento Atuais

As chaves usadas hoje sao principalmente:

- `CNPJ`: chave principal para relacionar entidades, CDEN, precursoras e projetos.
- `CNPJ normalizado`: usado em alguns pontos para evitar divergencia de mascara.
- `SEI`: identificador de processo/projeto, usado na UI e em agrupamentos.
- `tipoRepasse`: diferencia Fomento e Patrocinio na visao final.
- `ano/ciclo`: implicito no arquivo de origem, nao como entidade de dados formal.

Risco atual: o CNPJ e normalizado em alguns fluxos, mas nao existe uma camada central obrigatoria de identidade de entidade ou projeto.

## Problema Estrutural

O objeto final `EntidadeSelecionada` concentra muitos conceitos:

- cadastro da entidade;
- projeto ou repasse;
- ciclo;
- fiscalizacao;
- acompanhamento de execucao;
- classificacao Infra-BR;
- grupo institucional CDEN/Precursora;
- campos especificos de Fomento;
- campos especificos de Patrocinio.

Isso facilita a renderizacao atual, mas dificulta manutencao de dados vivos, pois cada novo ciclo tende a adicionar novos campos e excecoes no mesmo objeto final.

## Modelo Alvo Proposto

O modelo recomendado e hibrido: uma base comum para o que e transversal, e bases especificas para preservar a natureza propria de Fomento e Patrocinio.

### entidades

Armazena dados cadastrais estaveis da entidade, independentemente de ciclos ou projetos.

Campos candidatos:

- `cnpj`
- `cnpj_normalizado`
- `nome_razao_social`
- `nome_fantasia`
- `sigla`
- `uf`
- `cidade`
- `endereco`
- `telefone`
- `email`
- `representante_legal`
- `dados_bancarios`
- `is_cden`
- `is_precursora`
- `fonte_cadastro`
- `data_ultima_atualizacao`

Papel: responder quem e a entidade e evitar duplicacao de dados cadastrais em cada arquivo de projeto.

### projetos_base

Armazena os campos realmente comuns a qualquer projeto, seja Fomento ou Patrocinio.

Campos candidatos:

- `projeto_id`
- `tipo_projeto`
- `ciclo`
- `cnpj_entidade`
- `nome_entidade_snapshot`
- `uf_snapshot`
- `sei`
- `titulo_ou_objeto_resumido`
- `valor_repasse`
- `valor_projeto`
- `fiscal`
- `fiscal_suplente`
- `data_inicio_prevista`
- `data_fim_prevista`
- `status_geral`
- `fonte_arquivo`
- `data_importacao`

Papel: permitir analises transversais por UF, entidade, ciclo, valor, fiscal, status e historico, sem misturar campos especificos de cada modalidade.

### projetos_fomento

Armazena os campos especificos de projetos de Fomento.

Campos candidatos:

- `projeto_id`
- `objetivo_estrategico`
- `objetivo_especifico`
- `objetivo_completo`
- `area_abrangencia`
- `publico_alvo`
- `direcionamento_estrategico`
- `texto_norm`
- `ranking_aderencia_infrabr`
- `scores_dimensoes`
- `dimensao_principal`
- `ranking_componentes`
- `ranking_indicadores`
- `termos_detectados`
- `produtos_tecnicos_previstos`
- `municipio_beneficiado`

Papel: preservar a riqueza analitica do Fomento, que envolve planejamento publico, aderencia ao Infra-BR, objeto tecnico, area de abrangencia e produtos esperados.

### projetos_patrocinio

Armazena os campos especificos de projetos de Patrocinio.

Campos candidatos:

- `projeto_id`
- `tipo_patrocinio`
- `tipo_publicacao`
- `evento_ou_projeto`
- `mes`
- `cidade`
- `local_realizacao`
- `publico_estimado`
- `contrapartidas`
- `descricao_acao`
- `categoria_evento`
- `abrangencia_evento`
- `resultado_esperado`
- `evidencias_entrega`

Papel: preservar a natureza propria do Patrocinio, que tende a girar em torno de evento, publicacao, acao institucional, contrapartidas, publico e periodo de realizacao.

### acompanhamento_projetos

Armazena a evolucao viva do projeto durante sua execucao.

Campos candidatos:

- `acompanhamento_id`
- `projeto_id`
- `data_atualizacao`
- `status_execucao`
- `inicio_execucao`
- `fim_execucao`
- `termo`
- `data_primeiro_repasse`
- `valor_primeiro_repasse`
- `data_segundo_repasse`
- `valor_segundo_repasse`
- `percentual_execucao`
- `situacao_prestacao_contas`
- `situacao_final`
- `observacoes`
- `responsavel_atualizacao`
- `fonte_arquivo`

Papel: permitir atualizacoes recorrentes sem alterar cadastro nem dados estruturantes do projeto.

### tabelas auxiliares/classificacoes

Armazena dados de apoio, listas controladas e relacoes derivadas.

Exemplos:

- `classificacoes_infrabr_projeto`: projeto, dimensao, componente, indicador, score e termos.
- `grupos_entidade`: CNPJ, grupo, fonte e data de referencia.
- `ufs_regioes`: UF, estado e regiao.
- `status_projeto`: codigo, nome, ordem, cor e criticidade.
- `ciclos`: ciclo, tipo, edital/chamamento, ano inicial e ano final.

Papel: reduzir regras espalhadas no codigo e padronizar filtros, cores, grupos e classificacoes.

## Estrategia de Migracao Recomendada

### Fase 0 - Inventario e Contratos

- Consolidar dicionario dos campos atuais.
- Definir chaves canonicas: `cnpj_normalizado`, `projeto_id`, `sei`, `ciclo`.
- Definir schemas Zod para cada tabela alvo.
- Definir politica de snapshots para nome/UF da entidade em cada projeto.

Registro da fase: `docs/dados/inventario-fase-0-dados-vivos.md`.

### Fase 1 - Normalizacao Paralela

- Criar normalizers que gerem `entidades`, `projetos_base`, `projetos_fomento`, `projetos_patrocinio`, `acompanhamento_projetos` e auxiliares em paralelo.
- Nao substituir `EntidadeSelecionada` ainda.
- Validar contagens, chaves duplicadas e joins.

Status inicial: o primeiro bloco paralelo criou schemas, normalizers e validacao para `entidades` e `projetos_base` em `src/data/dados-vivos`, com script `npm.cmd run data:validate-dados-vivos`.

### Fase 2 - Adapter de Compatibilidade

- Criar adapter que reconstrua a visao atual do app a partir do modelo novo.
- Comparar com a saida atual de `parseData`.
- Manter consumidores sem alteracao.

### Fase 3 - Consumo Gradual

- Migrar consumidores por blocos pequenos.
- Priorizar primeiro paineis menos criticos e depois fiscalizacao, diretorios, IA e financeiros.
- Manter validadores de equivalencia ate estabilizar.

### Fase 4 - Automacao de Atualizacao

- Criar script para ler arquivos de entrada atualizados.
- Gerar relatorio de diferencas: entidades novas, projetos novos, projetos alterados, campos vazios e conflitos.
- Bloquear exportacao quando houver erro estrutural.
- Exportar arquivos canonicos consumidos pelo app.

## Validacoes Necessarias

- CNPJ normalizado obrigatorio para entidades e projetos.
- Projeto deve ter chave estavel.
- Projeto deve apontar para entidade existente ou gerar alerta de entidade nova.
- Acompanhamento deve apontar para projeto existente.
- `tipo_projeto` deve controlar qual tabela especifica e obrigatoria.
- Campos especificos de Fomento nao devem vazar para Patrocinio, e vice-versa.
- Datas e valores devem ser parseados com padrao unico.
- Alteracoes de arquivos vivos devem gerar relatorio antes de afetar runtime.

## Decisoes Pendentes

- Definir formato canonico de saida: CSV, JSON ou ambos.
- Definir onde ficarao arquivos de entrada vivos.
- Definir se `projeto_id` sera baseado em `tipo + ciclo + sei`, `tipo + ciclo + cnpj` ou outra composicao.
- Definir como tratar projetos sem SEI ou com SEI duplicado.
- Definir se dados bancarios entram no app ou permanecem restritos a uso operacional.

## Proxima Acao Recomendada

Apos o primeiro bloco da Fase 1 paralela, ampliar o modelo em bloco pequeno para `projetos_fomento` e `projetos_patrocinio`, ainda sem trocar o runtime atual.
