# Alterações Pendentes de Sincronismo (GitHub)

Este arquivo registra todas as modificações realizadas no projeto desde o último sincronismo. Ele deve ser utilizado pela plataforma para gerar a mensagem de Pull Request / Commit de forma completa e em Português do Brasil (pt-BR). Ao receber a confirmação de que o sincronismo foi realizado, este arquivo deve ser "zerado" pelo agente.

## Atualizações recentes:
- Integração do novo arquivo CSV validado (`GestaoFomento26_Marco3_3_OFICIAL_VALIDADO.csv`) contendo novas informações granulares do Infra-BR (Dimensões, Componentes, Indicadores e seus scores).
- Criação de script conversor automatizado para transformar o referido CSV bruto em um módulo TypeScript com exportação estática (`newFomentoData.ts`), garantindo melhor compatibilidade com o pipeline de validação (`validateData.ts`) usando Vite e tsx.
- Expansão da interface TypeScript `EntidadeSelecionada` para acomodar mais de 20 novas propriedades referentes a avaliações, rankings, escores de componentes e indicadores.
- Atualização do componente `Directory.tsx` para apresentar em uma grade visual responsiva os campos de Rankings de Dimensões, Ranking de Componentes e Ranking de Indicadores na linha expandida de cada entidade, proporcionando uma visão muito mais rica da aderência setorial.
- Implementação de coloração dinâmica baseada na taxonomia e cores predefinidas do modelo Infra-BR no painel de expansão de `Directory.tsx`. Componentes e indicadores agora resgatam e herdam de forma hierárquica e visual a cor correspondente da sua respectiva dimensão-mãe.
