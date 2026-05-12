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
}

export const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Visão Geral Corrente', icon: LayoutDashboard, depth: 0 },
  { id: 'current_directory', label: 'Diretório de Entidades', icon: List, depth: 1 },
  { id: 'current_fiscal', label: 'Visão do Fiscal', icon: UserCheck, depth: 1 },
  { id: 'current_financial', label: 'Painel Financeiro', icon: LineChart, depth: 1 },

  { id: 'history', label: 'Histórico (2025)', icon: History, depth: 0 },
  { id: 'history_fomento', label: 'Fomento (2025)', icon: TableProperties, depth: 1 },
  { id: 'history_fomento_dir', label: 'Diretório de Entidades', icon: List, depth: 2 },
  { id: 'history_fomento_fin', label: 'Painel Financeiro', icon: LineChart, depth: 2 },
  { id: 'history_patrocinio', label: 'Patrocínio (2025)', icon: TableProperties, depth: 1 },
  { id: 'history_patrocinio_dir', label: 'Diretório de Entidades', icon: List, depth: 2 },
  { id: 'history_patrocinio_fin', label: 'Painel Financeiro', icon: LineChart, depth: 2 },
  { id: 'history_entidades', label: 'Entidades (2025)', icon: Users, depth: 1 },
  { id: 'history_entidades_dir', label: 'Diretório de Entidades', icon: List, depth: 2 },
  { id: 'history_ec_geral', label: 'EC Geral', icon: List, depth: 2 },

  { id: 'insights', label: 'Insights e Análises', icon: Lightbulb, depth: 0 },
  { id: 'insights_forca', label: 'Força por Estado', icon: LayoutDashboard, depth: 1 },
  { id: 'insights_ec', label: 'Visão EC Geral', icon: LayoutDashboard, depth: 1 },
  { id: 'insights_infra', label: 'Avaliação Infra-BR', icon: LayoutDashboard, depth: 1 },

  { id: 'ai_assistant', label: 'IA - Consulta', icon: Sparkles, depth: 0 }
];

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