# Alterações Pendentes de Sincronismo (GitHub)
## Registro automático - 14/05/2026, 17:57

- **Ajustes de integração local com GitHub e Vercel**:
  - Versionado o arquivo .agent.md como referência operacional do agente do projeto.
  - Configurado o terminal integrado do VS Code para usar Command Prompt no Windows, evitando bloqueio de execução do npm.ps1 no PowerShell.
  - Reforçado o .gitignore para manter arquivos .env*.local fora do versionamento.
  - Removida a substituição de GEMINI_API_KEY no bundle Vite e eliminado serviço legado de IA no frontend, mantendo o uso da chave restrito à rota serverless /api/ai.
