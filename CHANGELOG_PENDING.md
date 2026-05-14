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
