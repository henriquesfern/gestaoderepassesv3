import Papa from 'papaparse';
import { cdenCSV } from '../cden';
import { fomento2025CSV } from '../fomento2025';
import { fomento2026CSV } from '../fomento2026';
import { gestaofomento26 } from '../gestaofomento26';
import { patrocinioCSV } from '../patrocinio2025';
import { precursorasCSV } from '../precursoras';
import { parseCurrency, parseNumberBR } from '../../utils/formatters';
import type {
  AcompanhamentoProjetoDadosVivos,
  AlertaDadosVivos,
  EntidadeDadosVivos,
  FonteProjetoDadosVivos,
  ModeloDadosVivosParalelo,
  ProjetoBaseDadosVivos,
  ProjetoFomentoDadosVivos,
  ProjetoPatrocinioDadosVivos,
  TipoProjetoDadosVivos,
} from './types';

type CsvRow = Record<string, string | number | undefined>;

const FONTE_FOMENTO_2026 = 'fomento2026';
const FONTE_FOMENTO_2025 = 'fomento2025';
const FONTE_PATROCINIO_2025 = 'patrocinio2025';
const FONTE_GESTAO_FOMENTO_2026 = 'gestaofomento26';

function parseCsv<T extends CsvRow>(csv: string, delimiter?: string): T[] {
  return Papa.parse<T>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter,
  }).data;
}

export function normalizarCnpj(cnpj: unknown): string {
  return String(cnpj ?? '').replace(/\D/g, '');
}

function normalizarTexto(valor: unknown): string {
  return String(valor ?? '').trim();
}

function chaveComparavel(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function obterCampo(row: CsvRow, ...nomes: string[]): unknown {
  for (const nome of nomes) {
    if (row[nome] !== undefined) return row[nome];
  }

  const mapa = new Map(Object.keys(row).map((chave) => [chaveComparavel(chave), chave]));

  for (const nome of nomes) {
    const chaveReal = mapa.get(chaveComparavel(nome));
    if (chaveReal && row[chaveReal] !== undefined) return row[chaveReal];
  }

  return undefined;
}

function indefinidoSeVazio(valor: unknown): string | undefined {
  const texto = normalizarTexto(valor);
  if (!texto || texto === '-') return undefined;
  return texto;
}

function normalizarProcesso(valor: unknown): string {
  return normalizarTexto(valor)
    .replace(/[^0-9a-zA-Z]/g, '')
    .toLowerCase();
}

function criarProjetoId(
  tipo: TipoProjetoDadosVivos,
  ciclo: string,
  processo: unknown,
  cnpj: string,
  indice: number,
  alertas: AlertaDadosVivos[],
): string {
  const processoNormalizado = normalizarProcesso(processo);

  if (processoNormalizado) {
    return `${tipo}:${ciclo}:${processoNormalizado}`;
  }

  alertas.push({
    nivel: 'aviso',
    codigo: 'PROJETO_SEM_PROCESSO',
    mensagem: 'Projeto sem SEI/processo; projeto_id gerado por fallback.',
    referencia: `${tipo}:${ciclo}:${cnpj}:${indice}`,
  });

  return `${tipo}:${ciclo}:${cnpj}:${indice}`;
}

function parseNumero(valor: unknown): number | undefined {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : undefined;
  const texto = normalizarTexto(valor);
  if (!texto) return undefined;
  const numero = parseNumberBR(texto);
  return Number.isFinite(numero) ? numero : undefined;
}

function parseValor(valor: unknown): number {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
  return parseCurrency(normalizarTexto(valor));
}

function parseValorOpcional(valor: unknown): number | undefined {
  if (indefinidoSeVazio(valor) === undefined) return undefined;
  return parseValor(valor);
}

function escolherAtual(atual: string | undefined, candidato: unknown): string | undefined {
  return atual || indefinidoSeVazio(candidato);
}

function registrarEntidade(
  entidades: Map<string, EntidadeDadosVivos>,
  row: CsvRow,
  fonte: FonteProjetoDadosVivos,
  grupos: { cden: Set<string>; precursoras: Set<string> },
  campos: {
    cnpj: string;
    nome: string;
    sigla?: string;
    estado?: string;
    uf?: string;
    cidade?: string;
  },
  alertas: AlertaDadosVivos[],
): string | undefined {
  const cnpj = normalizarCnpj(obterCampo(row, campos.cnpj));
  const nome = indefinidoSeVazio(obterCampo(row, campos.nome));

  if (!cnpj) {
    alertas.push({
      nivel: 'erro',
      codigo: 'ENTIDADE_SEM_CNPJ',
      mensagem: 'Linha de entidade/projeto sem CNPJ.',
      referencia: `${fonte}:${nome ?? 'sem-nome'}`,
    });
    return undefined;
  }

  if (!nome) {
    alertas.push({
      nivel: 'erro',
      codigo: 'ENTIDADE_SEM_NOME',
      mensagem: 'Linha de entidade/projeto sem nome de entidade.',
      referencia: `${fonte}:${cnpj}`,
    });
    return undefined;
  }

  const existente = entidades.get(cnpj);

  if (existente) {
    existente.nome_atual = escolherAtual(existente.nome_atual, nome) ?? existente.nome_atual;
    existente.sigla = escolherAtual(existente.sigla, campos.sigla ? obterCampo(row, campos.sigla) : undefined);
    existente.estado = escolherAtual(existente.estado, campos.estado ? obterCampo(row, campos.estado) : undefined);
    existente.uf = escolherAtual(existente.uf, campos.uf ? obterCampo(row, campos.uf) : undefined);
    existente.cidade = escolherAtual(existente.cidade, campos.cidade ? obterCampo(row, campos.cidade) : undefined);
    existente.is_cden = existente.is_cden || grupos.cden.has(cnpj);
    existente.is_precursora = existente.is_precursora || grupos.precursoras.has(cnpj);
    if (!existente.fontes.includes(fonte)) existente.fontes.push(fonte);
    return cnpj;
  }

  entidades.set(cnpj, {
    entidade_id: `cnpj:${cnpj}`,
    cnpj_normalizado: cnpj,
    nome_atual: nome,
    sigla: campos.sigla ? indefinidoSeVazio(obterCampo(row, campos.sigla)) : undefined,
    uf: campos.uf ? indefinidoSeVazio(obterCampo(row, campos.uf)) : undefined,
    estado: campos.estado ? indefinidoSeVazio(obterCampo(row, campos.estado)) : undefined,
    cidade: campos.cidade ? indefinidoSeVazio(obterCampo(row, campos.cidade)) : undefined,
    is_cden: grupos.cden.has(cnpj),
    is_precursora: grupos.precursoras.has(cnpj),
    fontes: [fonte],
  });

  return cnpj;
}

function criarProjetoBase(params: {
  row: CsvRow;
  indice: number;
  tipo: TipoProjetoDadosVivos;
  ciclo: string;
  fonte: FonteProjetoDadosVivos;
  cnpj: string;
  nome: string;
  sigla?: unknown;
  uf?: unknown;
  estado?: unknown;
  cidade?: unknown;
  sei?: unknown;
  titulo?: unknown;
  valorRepasse?: unknown;
  valorProjeto?: unknown;
  nota?: unknown;
  fiscal?: unknown;
  fiscalSuplente?: unknown;
  dataInicio?: unknown;
  dataFim?: unknown;
  status?: unknown;
  alertas: AlertaDadosVivos[];
}): ProjetoBaseDadosVivos {
  const projetoId = criarProjetoId(
    params.tipo,
    params.ciclo,
    params.sei,
    params.cnpj,
    params.indice,
    params.alertas,
  );
  const valorProjeto = params.valorProjeto === undefined ? undefined : parseValor(params.valorProjeto);
  const nota = parseNumero(params.nota);

  return {
    projeto_id: projetoId,
    tipo_projeto: params.tipo,
    ciclo: params.ciclo,
    cnpj_entidade: params.cnpj,
    nome_entidade_snapshot: params.nome,
    sigla_snapshot: indefinidoSeVazio(params.sigla),
    uf_snapshot: indefinidoSeVazio(params.uf),
    estado_snapshot: indefinidoSeVazio(params.estado),
    cidade_snapshot: indefinidoSeVazio(params.cidade),
    sei: indefinidoSeVazio(params.sei),
    titulo_ou_objeto_resumido: indefinidoSeVazio(params.titulo),
    valor_repasse: parseValor(params.valorRepasse),
    valor_projeto: valorProjeto,
    nota,
    fiscal: indefinidoSeVazio(params.fiscal),
    fiscal_suplente: indefinidoSeVazio(params.fiscalSuplente),
    data_inicio_prevista: indefinidoSeVazio(params.dataInicio),
    data_fim_prevista: indefinidoSeVazio(params.dataFim),
    status_geral: indefinidoSeVazio(params.status),
    fonte_arquivo: params.fonte,
  };
}

function criarProjetoFomento2026(row: CsvRow, projetoId: string): ProjetoFomentoDadosVivos {
  return {
    projeto_id: projetoId,
    objetivo_estrategico: indefinidoSeVazio(row.OBJETIVO_ESTRATEGICO),
    objetivo_especifico: indefinidoSeVazio(row.OBJETIVO_ESPECIFICO),
    objetivo_completo: indefinidoSeVazio(row.OBJETIVO_COMPLETO),
    area_abrangencia: indefinidoSeVazio(row.AREA_ABRANGENCIA),
    publico_alvo: indefinidoSeVazio(row.PUBLICO_ALVO),
    texto_norm: indefinidoSeVazio(row.TEXTO_NORM),
    ranking_aderencia_infrabr: indefinidoSeVazio(row.RANKING_ADERENCIA_INFRABR),
    scores_dimensoes: indefinidoSeVazio(row.SCORES),
    dimensao_principal: indefinidoSeVazio(row.DIMENSAO_PRINCIPAL),
    termos_detectados: indefinidoSeVazio(row.TERMOS_DETECTADOS),
  };
}

function criarProjetoFomento2025(row: CsvRow, projetoId: string): ProjetoFomentoDadosVivos {
  return {
    projeto_id: projetoId,
    linha_solicitada: indefinidoSeVazio(obterCampo(row, 'Linha Solicitada')),
    resultado_classificacao: indefinidoSeVazio(obterCampo(row, 'Resultado 2 FASE')),
  };
}

function criarProjetoPatrocinio2025(row: CsvRow, projetoId: string): ProjetoPatrocinioDadosVivos {
  return {
    projeto_id: projetoId,
    tipo_patrocinio: indefinidoSeVazio(row.Tipo),
    tipo_publicacao: indefinidoSeVazio(row.TipoPublicacao),
    mes: indefinidoSeVazio(obterCampo(row, 'Mes')),
    evento_ou_projeto: indefinidoSeVazio(row.Projeto),
    cidade_realizacao: indefinidoSeVazio(row.Cidade),
    local_realizacao: indefinidoSeVazio(row['Local Entidade']),
    fiscal_crea: indefinidoSeVazio(row['Fiscal Crea']),
  };
}

function criarAcompanhamentosFomento2026(
  rows: CsvRow[],
  projetos: ProjetoBaseDadosVivos[],
  alertas: AlertaDadosVivos[],
): AcompanhamentoProjetoDadosVivos[] {
  const projetosFomento2026PorCnpj = new Map(
    projetos
      .filter((projeto) => projeto.tipo_projeto === 'fomento' && projeto.ciclo === '2026')
      .map((projeto) => [projeto.cnpj_entidade, projeto]),
  );

  return rows.flatMap((row, indice) => {
    const cnpj = normalizarCnpj(row.cnpj);
    const projeto = projetosFomento2026PorCnpj.get(cnpj);

    if (!cnpj || !projeto) {
      alertas.push({
        nivel: 'erro',
        codigo: 'ACOMPANHAMENTO_SEM_PROJETO_BASE',
        mensagem: 'Registro de acompanhamento sem projeto base de Fomento 2026 correspondente.',
        referencia: `${FONTE_GESTAO_FOMENTO_2026}:${cnpj || indice}`,
      });
      return [];
    }

    return [{
      acompanhamento_id: `${FONTE_GESTAO_FOMENTO_2026}:${projeto.projeto_id}`,
      projeto_id: projeto.projeto_id,
      cnpj_entidade: cnpj,
      status_execucao: indefinidoSeVazio(row.status),
      inicio_execucao: indefinidoSeVazio(row.inicioexecucao),
      fim_execucao: indefinidoSeVazio(row.fimexecucao),
      termo: indefinidoSeVazio(row.termodefomento),
      valor_primeiro_repasse: parseValorOpcional(row.primeirorepasse),
      data_primeiro_repasse: indefinidoSeVazio(row.dataprimeirorepasse),
      valor_segundo_repasse: parseValorOpcional(row.segundorepasse),
      data_segundo_repasse: indefinidoSeVazio(row.datasegundorepasse),
      fiscal_suplente: indefinidoSeVazio(row.fiscalsuplente),
      situacao_final: indefinidoSeVazio(row.situacaofinal),
      fonte_arquivo: FONTE_GESTAO_FOMENTO_2026,
    }];
  });
}

function carregarGrupos() {
  const cdenRows = parseCsv<CsvRow>(cdenCSV);
  const precursorasRows = parseCsv<CsvRow>(precursorasCSV);

  return {
    cden: new Set(cdenRows.map((row) => normalizarCnpj(row.CNPJ)).filter(Boolean)),
    precursoras: new Set(precursorasRows.map((row) => normalizarCnpj(row.CNPJ)).filter(Boolean)),
  };
}

function validarDuplicidades(projetos: ProjetoBaseDadosVivos[], alertas: AlertaDadosVivos[]): void {
  const porProjeto = new Map<string, number>();

  for (const projeto of projetos) {
    porProjeto.set(projeto.projeto_id, (porProjeto.get(projeto.projeto_id) ?? 0) + 1);
  }

  for (const [projetoId, total] of porProjeto) {
    if (total > 1) {
      alertas.push({
        nivel: 'erro',
        codigo: 'PROJETO_ID_DUPLICADO',
        mensagem: `Projeto_id duplicado encontrado ${total} vezes.`,
        referencia: projetoId,
      });
    }
  }
}

function validarRelacionamentos(
  entidades: Map<string, EntidadeDadosVivos>,
  projetos: ProjetoBaseDadosVivos[],
  projetosFomento: ProjetoFomentoDadosVivos[],
  projetosPatrocinio: ProjetoPatrocinioDadosVivos[],
  acompanhamentos: AcompanhamentoProjetoDadosVivos[],
  alertas: AlertaDadosVivos[],
): void {
  const projetosBaseIds = new Set(projetos.map((projeto) => projeto.projeto_id));
  const fomentoIds = new Set(projetosFomento.map((projeto) => projeto.projeto_id));
  const patrocinioIds = new Set(projetosPatrocinio.map((projeto) => projeto.projeto_id));

  for (const projeto of projetos) {
    if (!entidades.has(projeto.cnpj_entidade)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'PROJETO_SEM_ENTIDADE',
        mensagem: 'Projeto aponta para entidade inexistente.',
        referencia: projeto.projeto_id,
      });
    }

    if (projeto.tipo_projeto === 'fomento' && !fomentoIds.has(projeto.projeto_id)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'FOMENTO_SEM_REGISTRO_ESPECIFICO',
        mensagem: 'Projeto base de Fomento sem registro em projetos_fomento.',
        referencia: projeto.projeto_id,
      });
    }

    if (projeto.tipo_projeto === 'patrocinio' && !patrocinioIds.has(projeto.projeto_id)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'PATROCINIO_SEM_REGISTRO_ESPECIFICO',
        mensagem: 'Projeto base de Patrocinio sem registro em projetos_patrocinio.',
        referencia: projeto.projeto_id,
      });
    }
  }

  for (const projeto of projetosFomento) {
    if (!projetosBaseIds.has(projeto.projeto_id)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'FOMENTO_SEM_PROJETO_BASE',
        mensagem: 'Registro de Fomento sem projeto base correspondente.',
        referencia: projeto.projeto_id,
      });
    }
  }

  for (const projeto of projetosPatrocinio) {
    if (!projetosBaseIds.has(projeto.projeto_id)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'PATROCINIO_SEM_PROJETO_BASE',
        mensagem: 'Registro de Patrocinio sem projeto base correspondente.',
        referencia: projeto.projeto_id,
      });
    }
  }

  for (const acompanhamento of acompanhamentos) {
    if (!projetosBaseIds.has(acompanhamento.projeto_id)) {
      alertas.push({
        nivel: 'erro',
        codigo: 'ACOMPANHAMENTO_SEM_PROJETO_BASE',
        mensagem: 'Registro de acompanhamento sem projeto base correspondente.',
        referencia: acompanhamento.acompanhamento_id,
      });
    }
  }
}

export function construirModeloDadosVivosParalelo(): ModeloDadosVivosParalelo {
  const alertas: AlertaDadosVivos[] = [];
  const entidades = new Map<string, EntidadeDadosVivos>();
  const projetos: ProjetoBaseDadosVivos[] = [];
  const projetosFomento: ProjetoFomentoDadosVivos[] = [];
  const projetosPatrocinio: ProjetoPatrocinioDadosVivos[] = [];
  const grupos = carregarGrupos();

  const fomento2026 = parseCsv<CsvRow>(fomento2026CSV);
  const fomento2025 = parseCsv<CsvRow>(fomento2025CSV);
  const patrocinio2025 = parseCsv<CsvRow>(patrocinioCSV);

  fomento2026.forEach((row, indice) => {
    const cnpj = registrarEntidade(
      entidades,
      row,
      FONTE_FOMENTO_2026,
      grupos,
      { cnpj: 'CNPJ', nome: 'ENTIDADE', estado: 'ESTADO', uf: 'SIGLA_UF' },
      alertas,
    );
    const nome = indefinidoSeVazio(row.ENTIDADE);
    if (!cnpj || !nome) return;

    const projetoBase = criarProjetoBase({
        row,
        indice,
        tipo: 'fomento',
        ciclo: '2026',
        fonte: FONTE_FOMENTO_2026,
        cnpj,
        nome,
        uf: row.SIGLA_UF,
        estado: row.ESTADO,
        sei: row.SEI,
        titulo: row.OBJETIVO_COMPLETO,
        valorRepasse: row.VALOR_CONCEDENTEAJUSTADO,
        valorProjeto: row.VALORPROJETO,
        nota: obterCampo(row, 'MEDIA'),
        fiscal: row.FISCAL,
        alertas,
      });

    projetos.push(projetoBase);
    projetosFomento.push(criarProjetoFomento2026(row, projetoBase.projeto_id));
  });

  fomento2025.forEach((row, indice) => {
    const cnpj = registrarEntidade(
      entidades,
      row,
      FONTE_FOMENTO_2025,
      grupos,
      {
        cnpj: 'CNPJ',
        nome: 'Razao Social',
        sigla: 'Sigla',
        estado: 'Estado',
        cidade: 'Cidade',
      },
      alertas,
    );
    const nome = indefinidoSeVazio(obterCampo(row, 'Razao Social'));
    if (!cnpj || !nome) return;

    const projetoBase = criarProjetoBase({
        row,
        indice,
        tipo: 'fomento',
        ciclo: '2025',
        fonte: FONTE_FOMENTO_2025,
        cnpj,
        nome,
        sigla: row.Sigla,
        estado: row.Estado,
        cidade: row.Cidade,
        sei: row['Processo SEI'],
        titulo: obterCampo(row, 'Linha Solicitada'),
        valorRepasse: row.Valor,
        nota: obterCampo(row, 'Classificacao'),
        dataInicio: obterCampo(row, 'DATA INICIO'),
        dataFim: row['DATA FIM'],
        status: obterCampo(row, 'Resultado 2 FASE'),
        alertas,
      });

    projetos.push(projetoBase);
    projetosFomento.push(criarProjetoFomento2025(row, projetoBase.projeto_id));
  });

  patrocinio2025.forEach((row, indice) => {
    const cnpj = registrarEntidade(
      entidades,
      row,
      FONTE_PATROCINIO_2025,
      grupos,
      {
        cnpj: 'CNPJ',
        nome: 'Entidade',
        estado: 'Estado',
        cidade: 'Cidade',
      },
      alertas,
    );
    const nome = indefinidoSeVazio(row.Entidade);
    if (!cnpj || !nome) return;

    const projetoBase = criarProjetoBase({
        row,
        indice,
        tipo: 'patrocinio',
        ciclo: '2025',
        fonte: FONTE_PATROCINIO_2025,
        cnpj,
        nome,
        estado: row.Estado,
        cidade: row.Cidade,
        sei: row.SEI,
        titulo: row.Projeto,
        valorRepasse: obterCampo(row, 'Valor de Repasse'),
        nota: obterCampo(row, 'Pontuacao'),
        fiscal: row.Fiscal,
        fiscalSuplente: row['Fiscal Suplente'],
        dataInicio: obterCampo(row, 'Data Inicio'),
        dataFim: row['Data Fim'],
        status: row.Tipo,
        alertas,
      });

    projetos.push(projetoBase);
    projetosPatrocinio.push(criarProjetoPatrocinio2025(row, projetoBase.projeto_id));
  });

  validarDuplicidades(projetos, alertas);
  const acompanhamentos = criarAcompanhamentosFomento2026(gestaofomento26, projetos, alertas);
  validarRelacionamentos(entidades, projetos, projetosFomento, projetosPatrocinio, acompanhamentos, alertas);

  return {
    entidades: [...entidades.values()].sort((a, b) => a.cnpj_normalizado.localeCompare(b.cnpj_normalizado)),
    projetos_base: projetos,
    projetos_fomento: projetosFomento,
    projetos_patrocinio: projetosPatrocinio,
    acompanhamento_projetos: acompanhamentos,
    alertas,
  };
}
