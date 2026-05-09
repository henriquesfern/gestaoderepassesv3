import { appData } from '../src/data/parser';
import { appDataSchema } from '../src/data/schema';

function runValidation() {
  console.log("Iniciando a validação estrutural dos dados (Integração Zod + Vercel/GitHub CI)...");
  
  try {
    appDataSchema.parse(appData);
    console.log("✅ Dados validados com sucesso! A estrutura CSV e a conversão de Tipos estão perfeitas.");
    console.log(`📊 Validado: ${appData.fomento2026.length} projetos 2026, ${appData.fomentoHistorico.length} histórico fomento, ${appData.patrocinioHistorico.length} histórico patrocínio.`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ ERRO NA VALIDAÇÃO DOS DADOS!");
    console.error("Um erro estrutural foi encontrado no processo de parsing dos dados.");
    console.error("Detalhes do erro:");
    if (error.errors) {
      error.errors.forEach((e: any) => {
        const pathStr = e.path.join('.');
        let extraInfo = '';
        if (e.path[0] === 'fomento2026' && typeof e.path[1] === 'number') {
          const row = (appData as any).fomento2026[e.path[1]];
          extraInfo = ` | Entidade: "${row.ENTIDADE}" | Valor CNPJ: "${row?.CNPJ}"`;
        }
        console.error(`- Em ${pathStr}: ${e.message}${extraInfo}`);
      });
    } else {
      console.error(error);
    }
    console.error("\nCom o pipeline configurado, o Vercel impedirá este deploy com erro, possibilitando Rollback / Revisão segura via GitHub.");
    process.exit(1);
  }
}

runValidation();
