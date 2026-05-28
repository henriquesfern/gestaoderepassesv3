import type { EntidadeSelecionada } from '../../types';
import { getRegionByState } from '../regions';
import { construirModeloDadosVivosParalelo } from './normalizers';
import type {
  AcompanhamentoProjetoDadosVivos,
  ClassificacaoInfraBRProjetoDadosVivos,
  EntidadeDadosVivos,
  ModeloDadosVivosParalelo,
  ProjetoBaseDadosVivos,
  ProjetoFomentoDadosVivos,
  ProjetoPatrocinioDadosVivos,
} from './types';

export interface DadosVivosLegacyView {
  fomento2026: EntidadeSelecionada[];
  fomentoHistorico: EntidadeSelecionada[];
  patrocinioHistorico: EntidadeSelecionada[];
}

function vazioSeIndefinido(valor: unknown): string {
  return valor === undefined || valor === null ? '' : String(valor);
}

function formatarValorGestao(valor?: number): string | undefined {
  if (valor === undefined) return undefined;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function criarIndices(modelo: ModeloDadosVivosParalelo) {
  return {
    entidadesPorCnpj: new Map(modelo.entidades.map((entidade) => [entidade.cnpj_normalizado, entidade])),
    fomentoPorProjetoId: new Map(modelo.projetos_fomento.map((projeto) => [projeto.projeto_id, projeto])),
    patrocinioPorProjetoId: new Map(modelo.projetos_patrocinio.map((projeto) => [projeto.projeto_id, projeto])),
    acompanhamentoPorProjetoId: new Map(
      modelo.acompanhamento_projetos.map((acompanhamento) => [acompanhamento.projeto_id, acompanhamento]),
    ),
    classificacoesPorProjetoId: modelo.classificacoes_infrabr_projeto.reduce(
      (acc, classificacao) => {
        const existentes = acc.get(classificacao.projeto_id) ?? [];
        existentes.push(classificacao);
        acc.set(classificacao.projeto_id, existentes);
        return acc;
      },
      new Map<string, ClassificacaoInfraBRProjetoDadosVivos[]>(),
    ),
  };
}

function ordenarClassificacoes(
  classificacoes: ClassificacaoInfraBRProjetoDadosVivos[],
  nivel: ClassificacaoInfraBRProjetoDadosVivos['nivel'],
): ClassificacaoInfraBRProjetoDadosVivos[] {
  return classificacoes
    .filter((classificacao) => classificacao.nivel === nivel)
    .sort((a, b) => (a.ordem_ranking ?? 999) - (b.ordem_ranking ?? 999));
}

function metadadoOriginal(
  classificacoes: ClassificacaoInfraBRProjetoDadosVivos[],
  campo: 'ranking_original' | 'scores_original' | 'termos_componentes' | 'termos_indicadores',
): string {
  return classificacoes.find((classificacao) => classificacao[campo])?.[campo] ?? '';
}

function classificacoesInfraBRPorOrdem(
  classificacoes: ClassificacaoInfraBRProjetoDadosVivos[],
): Partial<EntidadeSelecionada> {
  const dimensoes = ordenarClassificacoes(classificacoes, 'dimensao');
  const componentes = ordenarClassificacoes(classificacoes, 'componente');
  const indicadores = ordenarClassificacoes(classificacoes, 'indicador');

  return {
    DIMENSAO_1: dimensoes[0]?.dimensao ?? '',
    DIMENSAO_2: dimensoes[1]?.dimensao ?? '',
    DIMENSAO_3: dimensoes[2]?.dimensao ?? '',
    DIMENSAO_4: dimensoes[3]?.dimensao ?? '',
    DIMENSAO_5: dimensoes[4]?.dimensao ?? '',
    RANKING_COMPONENTES: metadadoOriginal(componentes, 'ranking_original'),
    SCORES_COMPONENTES: metadadoOriginal(componentes, 'scores_original'),
    RANKING_INDICADORES: metadadoOriginal(indicadores, 'ranking_original'),
    SCORES_INDICADORES: metadadoOriginal(indicadores, 'scores_original'),
    TERMOS_COMPONENTES: metadadoOriginal(componentes, 'termos_componentes'),
    TERMOS_INDICADORES: metadadoOriginal(indicadores, 'termos_indicadores'),
    COMPONENTE_1: componentes[0]?.componente ?? '',
    COMPONENTE_2: componentes[1]?.componente ?? '',
    COMPONENTE_3: componentes[2]?.componente ?? '',
    COMPONENTE_4: componentes[3]?.componente ?? '',
    COMPONENTE_5: componentes[4]?.componente ?? '',
    COMPONENTE_6: componentes[5]?.componente ?? '',
    COMPONENTE_7: componentes[6]?.componente ?? '',
    INDICADOR_1: indicadores[0]?.indicador ?? '',
    INDICADOR_2: indicadores[1]?.indicador ?? '',
    INDICADOR_3: indicadores[2]?.indicador ?? '',
    INDICADOR_4: indicadores[3]?.indicador ?? '',
    INDICADOR_5: indicadores[4]?.indicador ?? '',
    INDICADOR_6: indicadores[5]?.indicador ?? '',
    INDICADOR_7: indicadores[6]?.indicador ?? '',
    INDICADOR_8: indicadores[7]?.indicador ?? '',
    INDICADOR_9: indicadores[8]?.indicador ?? '',
  };
}

function adaptarProjetoFomento(params: {
  projeto: ProjetoBaseDadosVivos;
  entidade?: EntidadeDadosVivos;
  fomento?: ProjetoFomentoDadosVivos;
  acompanhamento?: AcompanhamentoProjetoDadosVivos;
  classificacoes: ClassificacaoInfraBRProjetoDadosVivos[];
}): EntidadeSelecionada {
  const { projeto, entidade, fomento, acompanhamento, classificacoes } = params;
  const estado = projeto.estado_snapshot ?? entidade?.estado ?? projeto.uf_snapshot ?? entidade?.uf ?? '';
  const objetivo = fomento?.objetivo_estrategico ?? fomento?.linha_solicitada ?? projeto.titulo_ou_objeto_resumido ?? '';
  const categoria = fomento?.objetivo_estrategico ?? fomento?.linha_solicitada ?? '';

  return {
    ENTIDADE: projeto.nome_entidade_snapshot || entidade?.nome_atual || '',
    CNPJ: projeto.cnpj_entidade,
    OBJETIVO: objetivo,
    CATEGORIA: categoria,
    ESTADO: estado,
    NOTA: projeto.nota ?? 0,
    VOTOS: fomento?.votos ?? 0,
    VALOR_REPASSE: projeto.valor_repasse,
    CONTROLE_ORCAMENTO: fomento?.controle_orcamento ?? 0,
    VALOR_PROJETO: projeto.valor_projeto ?? projeto.valor_repasse,
    CONTROLE_PROJETO: fomento?.controle_projeto ?? 0,
    AJUSTE_VALOR_CONCEDENTE: '',
    TIPOENTIDADE: '',
    REGIÃO: getRegionByState(estado),
    FISCAL: projeto.fiscal ?? '',
    FISCAL_SUPLENTE: projeto.fiscal_suplente ?? acompanhamento?.fiscal_suplente ?? '',
    SEI: projeto.sei ?? '',
    IsCDEN: entidade?.is_cden ?? false,
    IsPrecursora: entidade?.is_precursora ?? false,
    tipoRepasse: 'Fomento',
    DATA_INICIO: projeto.data_inicio_prevista,
    DATA_FIM: projeto.data_fim_prevista,
    OBJETIVO_COMPLETO: fomento?.objetivo_completo ?? '',
    AREA_ABRANGENCIA: fomento?.area_abrangencia ?? '',
    OBJETIVO_ESPECIFICO_COMPLETO: fomento?.objetivo_especifico ?? '',
    PUBLICO_ALVO: fomento?.publico_alvo ?? '',
    OBJETIVO_ESTRATEGICO: fomento?.objetivo_estrategico ?? '',
    TEXTO_NORM: fomento?.texto_norm ?? '',
    gestao_inicioexecucao: acompanhamento?.inicio_execucao,
    gestao_fimexecucao: acompanhamento?.fim_execucao,
    gestao_termodefomento: acompanhamento?.termo,
    gestao_status: acompanhamento?.status_execucao,
    gestao_primeirorepasse: formatarValorGestao(acompanhamento?.valor_primeiro_repasse),
    gestao_dataprimeirorepasse: acompanhamento?.data_primeiro_repasse,
    gestao_segundorepasse: formatarValorGestao(acompanhamento?.valor_segundo_repasse),
    gestao_datasegundorepasse: acompanhamento?.data_segundo_repasse,
    gestao_fiscalsuplente: acompanhamento?.fiscal_suplente,
    gestao_situacaofinal: acompanhamento?.situacao_final,
    RANKING_ADERENCIA_INFRABR: fomento?.ranking_aderencia_infrabr ?? '',
    SCORES: fomento?.scores_dimensoes ?? '',
    DIMENSAO_PRINCIPAL: fomento?.dimensao_principal ?? '',
    TERMOS_DETECTADOS: fomento?.termos_detectados ?? '',
    ...classificacoesInfraBRPorOrdem(classificacoes),
  };
}

function capitalizarCategoriaPatrocinio(valor: string): string {
  if (!valor) return '';
  return `${valor.charAt(0).toUpperCase()}${valor.slice(1).toLowerCase()}`;
}

function categoriaPatrocinioHistorico(patrocinio?: ProjetoPatrocinioDadosVivos, statusGeral?: string): string {
  const tipo = patrocinio?.tipo_patrocinio ?? statusGeral ?? '';
  const tipoPublicacao = patrocinio?.tipo_publicacao ?? '';
  const categoria = tipo === 'PUBLICAÇÃO' && tipoPublicacao ? tipoPublicacao : tipo;

  return capitalizarCategoriaPatrocinio(categoria);
}

function dataFomentoHistorico(valor?: string): string {
  return valor ?? '-';
}

function adaptarProjetoPatrocinio(params: {
  projeto: ProjetoBaseDadosVivos;
  entidade?: EntidadeDadosVivos;
  patrocinio?: ProjetoPatrocinioDadosVivos;
}): EntidadeSelecionada {
  const { projeto, entidade, patrocinio } = params;
  const estado = projeto.estado_snapshot ?? entidade?.estado ?? '';
  const categoria = categoriaPatrocinioHistorico(patrocinio, projeto.status_geral);
  const titulo = projeto.titulo_ou_objeto_resumido ?? patrocinio?.evento_ou_projeto ?? categoria;
  const objetivo = titulo.length > 35 ? `${titulo.substring(0, 35)}...` : titulo;

  return {
    ENTIDADE: projeto.nome_entidade_snapshot || entidade?.nome_atual || '',
    CNPJ: projeto.cnpj_entidade,
    OBJETIVO: objetivo,
    CATEGORIA: categoria,
    ESTADO: estado,
    NOTA: projeto.nota ?? 0,
    VOTOS: 0,
    VALOR_REPASSE: projeto.valor_repasse,
    CONTROLE_ORCAMENTO: 0,
    VALOR_PROJETO: projeto.valor_projeto ?? 0,
    CONTROLE_PROJETO: 0,
    REGIÃO: getRegionByState(estado),
    FISCAL: projeto.fiscal ?? '',
    FISCAL_SUPLENTE: projeto.fiscal_suplente ?? '',
    SEI: projeto.sei ?? '',
    IsCDEN: entidade?.is_cden ?? false,
    IsPrecursora: entidade?.is_precursora ?? false,
    tipoRepasse: 'Patrocínio',
    DATA_INICIO: projeto.data_inicio_prevista,
    DATA_FIM: projeto.data_fim_prevista,
    MES: patrocinio?.mes ?? '',
  };
}

export function criarDadosVivosLegacyView(modelo: ModeloDadosVivosParalelo): DadosVivosLegacyView {
  const indices = criarIndices(modelo);

  const fomento2026: EntidadeSelecionada[] = [];
  const fomentoHistorico: EntidadeSelecionada[] = [];
  const patrocinioHistorico: EntidadeSelecionada[] = [];

  for (const projeto of modelo.projetos_base) {
    const entidade = indices.entidadesPorCnpj.get(projeto.cnpj_entidade);

    if (projeto.tipo_projeto === 'fomento') {
      const item = adaptarProjetoFomento({
        projeto,
        entidade,
        fomento: indices.fomentoPorProjetoId.get(projeto.projeto_id),
        acompanhamento: indices.acompanhamentoPorProjetoId.get(projeto.projeto_id),
        classificacoes: indices.classificacoesPorProjetoId.get(projeto.projeto_id) ?? [],
      });

      if (projeto.ciclo === '2026') {
        fomento2026.push(item);
      } else {
        fomentoHistorico.push({
          ...item,
          DATA_INICIO: dataFomentoHistorico(projeto.data_inicio_prevista),
          DATA_FIM: dataFomentoHistorico(projeto.data_fim_prevista),
        });
      }
    }

    if (projeto.tipo_projeto === 'patrocinio') {
      patrocinioHistorico.push(
        adaptarProjetoPatrocinio({
          projeto,
          entidade,
          patrocinio: indices.patrocinioPorProjetoId.get(projeto.projeto_id),
        }),
      );
    }
  }

  return {
    fomento2026,
    fomentoHistorico,
    patrocinioHistorico,
  };
}

export function carregarDadosVivosLegacyView(): DadosVivosLegacyView {
  return criarDadosVivosLegacyView(construirModeloDadosVivosParalelo());
}
