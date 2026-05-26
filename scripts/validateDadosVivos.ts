import { construirModeloDadosVivosParalelo } from '../src/data/dados-vivos';
import { modeloDadosVivosParaleloSchema } from '../src/data/dados-vivos/schema';

function contarPorFonte() {
  const modelo = construirModeloDadosVivosParalelo();
  const porFonte = new Map<string, number>();

  for (const projeto of modelo.projetos_base) {
    porFonte.set(projeto.fonte_arquivo, (porFonte.get(projeto.fonte_arquivo) ?? 0) + 1);
  }

  return { modelo, porFonte };
}

function assertSemErros(codigo: string, total: number): void {
  if (total > 0) {
    throw new Error(`${codigo}: ${total} erro(s) encontrado(s).`);
  }
}

const { modelo, porFonte } = contarPorFonte();
const validado = modeloDadosVivosParaleloSchema.parse(modelo);
const erros = validado.alertas.filter((alerta) => alerta.nivel === 'erro');
const avisos = validado.alertas.filter((alerta) => alerta.nivel === 'aviso');

if (erros.length > 0) {
  console.error(`Erros: ${erros.length}`);
  for (const erro of erros.slice(0, 10)) {
    console.error(`- ${erro.codigo}: ${erro.referencia ?? erro.mensagem}`);
  }
}

assertSemErros('VALIDACAO_DADOS_VIVOS', erros.length);

console.log('Modelo paralelo de dados vivos validado com sucesso.');
console.log(`Entidades: ${validado.entidades.length}`);
console.log(`Projetos base: ${validado.projetos_base.length}`);

for (const [fonte, total] of [...porFonte.entries()].sort()) {
  console.log(`- ${fonte}: ${total} projeto(s)`);
}

if (avisos.length > 0) {
  console.log(`Avisos: ${avisos.length}`);
  for (const aviso of avisos.slice(0, 10)) {
    console.log(`- ${aviso.codigo}: ${aviso.referencia ?? aviso.mensagem}`);
  }
}
