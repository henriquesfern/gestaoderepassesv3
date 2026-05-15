import type React from 'react';
import { LayoutDashboard, TableProperties, LineChart, UserCheck, Lightbulb, History, Users, List, Sparkles } from 'lucide-react';

export type TabId =
  | 'overview'
  | 'current_directory'
  | 'current_fiscal'
  | 'current_financial'
  | 'history'
  | 'history_fomento'
  | 'history_fomento_dir'
  | 'history_fomento_fin'
  | 'history_patrocinio'
  | 'history_patrocinio_dir'
  | 'history_patrocinio_fin'
  | 'history_entidades'
  | 'history_entidades_dir'
  | 'history_ec_geral'
  | 'insights'
  | 'insights_forca'
  | 'insights_ec'
  | 'insights_infra'
  | 'ai_assistant';

export interface MenuItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  depth: number;
  description: string;
}

export const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Visão Geral Corrente', icon: LayoutDashboard, depth: 0, description: 'Resumo executivo dos dados correntes.' },
  { id: 'current_directory', label: 'Diretório de Entidades', icon: List, depth: 1, description: 'Lista de entidades do ciclo corrente.' },
  { id: 'current_fiscal', label: 'Visão do Fiscal', icon: UserCheck, depth: 1, description: 'Acompanhamento fiscal do ciclo corrente.' },
  { id: 'current_financial', label: 'Painel Financeiro', icon: LineChart, depth: 1, description: 'Indicadores financeiros do ciclo corrente.' },

  { id: 'history', label: 'Histórico (2025)', icon: History, depth: 0, description: 'Resumo consolidado do histórico de 2025.' },
  { id: 'history_fomento', label: 'Fomento (2025)', icon: TableProperties, depth: 1, description: 'Visão histórica de fomento em 2025.' },
  { id: 'history_fomento_dir', label: 'Diretório de Entidades', icon: List, depth: 2, description: 'Entidades participantes do fomento histórico.' },
  { id: 'history_fomento_fin', label: 'Painel Financeiro', icon: LineChart, depth: 2, description: 'Indicadores financeiros do fomento histórico.' },
  { id: 'history_patrocinio', label: 'Patrocínio (2025)', icon: TableProperties, depth: 1, description: 'Visão histórica de patrocínio em 2025.' },
  { id: 'history_patrocinio_dir', label: 'Diretório de Entidades', icon: List, depth: 2, description: 'Entidades participantes do patrocínio histórico.' },
  { id: 'history_patrocinio_fin', label: 'Painel Financeiro', icon: LineChart, depth: 2, description: 'Indicadores financeiros do patrocínio histórico.' },
  { id: 'history_entidades', label: 'Entidades (2025)', icon: Users, depth: 1, description: 'Consolidação histórica por entidade.' },
  { id: 'history_entidades_dir', label: 'Diretório de Entidades', icon: List, depth: 2, description: 'Diretório consolidado de entidades históricas.' },
  { id: 'history_ec_geral', label: 'EC Geral', icon: List, depth: 2, description: 'Base geral de entidades de classe.' },

  { id: 'insights', label: 'Insights e Análises', icon: Lightbulb, depth: 0, description: 'Análises executivas e visões comparativas.' },
  { id: 'insights_forca', label: 'Força por Estado', icon: LayoutDashboard, depth: 1, description: 'Comparativo de força e repasse por UF.' },
  { id: 'insights_ec', label: 'Visão EC Geral', icon: LayoutDashboard, depth: 1, description: 'Insights sobre a base EC Geral.' },
  { id: 'insights_infra', label: 'Avaliação Infra-BR', icon: LayoutDashboard, depth: 1, description: 'Análise entre repasses e indicadores Infra-BR.' },

  { id: 'ai_assistant', label: 'IA - Consulta', icon: Sparkles, depth: 0, description: 'Assistente de IA para consulta dos dados.' }
];

// Abas ocultadas quando o Modo Apresentação estiver ativo.
// Para ocultar uma aba, remova o comentário da linha correspondente.
export const presentationHiddenTabs: TabId[] = [
  // 'overview', // Visão Geral Corrente - resumo executivo dos dados correntes.
  // 'current_directory', // Diretório de Entidades - lista de entidades do ciclo corrente.
   'current_fiscal', // Visão do Fiscal - acompanhamento fiscal do ciclo corrente.
   'current_financial', // Painel Financeiro - indicadores financeiros do ciclo corrente.
  // 'history', // Histórico (2025) - resumo consolidado do histórico de 2025.
  // 'history_fomento', // Fomento (2025) - visão histórica de fomento em 2025.
  // 'history_fomento_dir', // Diretório de Entidades - entidades participantes do fomento histórico.
  // 'history_fomento_fin', // Painel Financeiro - indicadores financeiros do fomento histórico.
  // 'history_patrocinio', // Patrocínio (2025) - visão histórica de patrocínio em 2025.
  // 'history_patrocinio_dir', // Diretório de Entidades - entidades participantes do patrocínio histórico.
  // 'history_patrocinio_fin', // Painel Financeiro - indicadores financeiros do patrocínio histórico.
  // 'history_entidades', // Entidades (2025) - consolidação histórica por entidade.
  // 'history_entidades_dir', // Diretório de Entidades - diretório consolidado de entidades históricas.
  // 'history_ec_geral', // EC Geral - base geral de entidades de classe.
  // 'insights', // Insights e Análises - análises executivas e visões comparativas.
   'insights_forca', // Força por Estado - comparativo de força e repasse por UF.
  // 'insights_ec', // Visão EC Geral - insights sobre a base EC Geral.
  // 'insights_infra', // Avaliação Infra-BR - análise entre repasses e indicadores Infra-BR.
  // 'ai_assistant', // IA - Consulta - assistente de IA para consulta dos dados.
];

export function isPresentationTabHidden(tab: TabId) {
  return presentationHiddenTabs.includes(tab);
}

export function getPresentationFallbackTab() {
  return menuItems.find((item) => !isPresentationTabHidden(item.id))?.id ?? 'overview';
}

export const sectionBreakAfter: TabId[] = [
  'current_financial',
  'history_ec_geral',
  'insights_infra'
];

export const getHeaderTitle = (tab: TabId) => {
  switch (tab) {
    case 'overview': return 'Visão Geral Corrente';
    case 'current_directory': return 'Diretório de Entidades';
    case 'current_fiscal': return 'Visão do Fiscal';
    case 'current_financial': return 'Painel Financeiro';
    case 'history': return 'Histórico (2025)';
    case 'history_fomento': return 'Histórico - Fomento (2025)';
    case 'history_fomento_dir': return 'Diretório de Entidades (Fomento - 2025)';
    case 'history_fomento_fin': return 'Painel Financeiro (Fomento - 2025)';
    case 'history_patrocinio': return 'Histórico - Patrocínio (2025)';
    case 'history_patrocinio_dir': return 'Diretório de Entidades (Patrocínio - 2025)';
    case 'history_patrocinio_fin': return 'Painel Financeiro (Patrocínio - 2025)';
    case 'history_entidades': return 'Histórico - Entidades (2025)';
    case 'history_entidades_dir': return 'Diretório de Entidades (Histórico - 2025)';
    case 'history_ec_geral': return 'EC Geral';
    case 'insights': return 'Insights e Análises';
    case 'insights_forca': return 'Força por Estado';
    case 'insights_ec': return 'Visão EC Geral';
    case 'insights_infra': return 'Avaliação Infra-BR';
    case 'ai_assistant': return 'IA - Consulta de Dados';
  }
};
