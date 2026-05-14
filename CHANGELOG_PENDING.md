# Alterações Pendentes de Sincronismo (GitHub)
## Registro automático - 13/05/2026, 20:44

- **Contexto normativo da IA movido para o backend**:
  - movido o artefato editais-context para a pasta data fora de src
  - ajustada a rota /api/ai para injetar o contexto normativo apenas no servidor
  - removida a importação de EDITAIS_CONTEXT do frontend para reduzir o bundle do cliente
  - atualizado o parser de PDFs para gerar o contexto fora da árvore de frontend
## Registro automático - 13/05/2026, 20:51

- **Otimização adicional do bundle inicial**:
  - Transformado o carregamento das abas em lazy load com Suspense para reduzir código inicial do frontend.
  - Separados chunks de IA/markdown e visualização no build da Vite para melhorar cache e carregamento sob demanda.
  - Movido o parser principal de dados para importação dinâmica no DataProvider, evitando que os datasets mais pesados entrem no bootstrap inicial.
## Registro automático - 13/05/2026, 21:10

- **Hotfix da IA em runtime na Vercel**:
  - Movido o artefato editais-context para api/_lib para garantir empacotamento junto da função serverless.
  - Ajustados os imports da rota /api/ai e do gerador de contexto para eliminar o ERR_MODULE_NOT_FOUND em produção.
## Registro automático - 13/05/2026, 21:16

- **Hotfix de compatibilidade do contexto normativo na Vercel**:
  - Convertido o artefato editais-context para arquivo JavaScript em api/_lib para compatibilidade direta com o runtime serverless.
  - Atualizados os imports da rota /api/ai e do gerador de contexto para usar o caminho explícito em .js.
## Registro automático - 13/05/2026, 21:32

- **Externalização dos datasets pesados do cliente**:
  - Criado pipeline de exportação para public/data com os datasets pesados de Fomento, Patrocínio e Infra-BR.
  - Tornado o parser principal assíncrono, carregando CSVs estáticos por fetch em vez de embutir bases grandes em módulos TypeScript.
  - Movido o consumo de Infra-BR para o appData do DataProvider, removendo imports síncronos dos blocos pesados em vários componentes e hooks.
  - Reduzido o chunk parser para cerca de 38 kB e eliminado o antigo bloco gigante de infraBR_parser do bundle.
## Registro automÃ¡tico - 14/05/2026, 00:00

- **Hotfix dos cards de Infra-BR na VisÃ£o Geral Corrente**:
  - Corrigido o loader de medias_BR para reconhecer os cabeÃ§alhos reais exportados do CSV.
  - Ajustado o parser numÃ©rico para tratar percentuais com `%`, restaurando os valores das seis dimensÃµes da mÃ©dia nacional.
  - Validado o painel com o carregamento correto das notas e mantidos `lint` e `build` em estado verde.
## Registro automÃ¡tico - 14/05/2026, 09:20

- **OtimizaÃ§Ã£o do chunk de visualizaÃ§Ã£o e internalizaÃ§Ã£o do mapa do Brasil**:
  - Internalizado o GeoJSON dos estados do Brasil em `public/maps`, removendo a dependÃªncia de runtime em `raw.githubusercontent.com`.
  - Criado helper compartilhado para carregamento do mapa nacional e aplicado nos blocos de visÃ£o geral e Infra-BR.
  - Separado o antigo chunk `visualization` em `maps`, `viz-core` e `charts`, eliminando o aviso de chunk circular do build.
  - Reduzido o bloco de mapas para cerca de 19 kB e baixado o chunk de grÃ¡ficos para cerca de 527 kB.
## Registro automático - 14/05/2026, 09:51

- **Protocolo de avaliação antes de PR ou continuação local**:
  - Registrado no AGENTS.md o critério obrigatório de avaliar coesão, impacto estrutural, risco de regressão, validação executada e pendência residual antes de decidir entre continuar localmente ou sincronizar no GitHub.
  - Definida a regra de recomendar PR primeiro quando o bloco já estiver validado e a próxima frente aumentar a complexidade ou mudar outra área estrutural.
