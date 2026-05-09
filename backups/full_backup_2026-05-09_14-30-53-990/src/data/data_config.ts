/**
 * CONFIGURAÇÃO CENTRAL DE VERSÃO DE DADOS
 * 
 * Este arquivo controla quais bases de dados estão "ativas" no sistema.
 * Para realizar um rollback, basta alterar a chave da versão correspondente.
 */

export const DATA_VERSION_CONFIG = {
  fomentoAtivo: '2026_v1', // Versão atual do Fomento 2026
  fomentoHistoricoAtivo: '2025_v1', // Versão atual do Histórico Fomento
  patrocinioHistoricoAtivo: '2025_v1', // Versão atual do Histórico Patrocínio
  infraBRAtivo: 'v1', // Versão atual dos dados Infra-BR
};

export type DataVersion = keyof typeof DATA_VERSION_CONFIG;
