import React from 'react';
import { Overview, GlobalEntitiesOverview } from '../../features/overview';
import { Directory, GlobalDirectory, DirectoryECGeral } from '../../features/directory';

import { FinancialPanel } from '../../features/financial';
import { FiscalView } from '../../features/fiscal';
import { InsightsView, StateForceView, InsightsECGeral } from '../../features/insights';

import { AIAssistant } from '../../features/ai';

import { InfraBRInsights } from '../../features/infra';
import { type AppData } from '../../context/DataContext';
import { type TabId } from '../navigation/tabs';

interface TabContentProps {
  activeTab: TabId;
  appData: AppData;
}

export function TabContent({ activeTab, appData }: TabContentProps) {
  return (
    <>
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'current_directory' && <Directory />}
      {activeTab === 'current_fiscal' && <FiscalView />}
      {activeTab === 'current_financial' && <FinancialPanel />}

      {activeTab === 'history_fomento' && <Overview data={appData.fomentoHistorico} theme="fomento" />}
      {activeTab === 'history_fomento_dir' && <Directory data={appData.fomentoHistorico} />}
      {activeTab === 'history_fomento_fin' && <FinancialPanel data={appData.fomentoHistorico} theme="fomento" />}
      {activeTab === 'history_patrocinio' && <Overview data={appData.patrocinioHistorico} theme="patrocinio" />}
      {activeTab === 'history_patrocinio_dir' && <Directory data={appData.patrocinioHistorico} />}
      {activeTab === 'history_patrocinio_fin' && <FinancialPanel data={appData.patrocinioHistorico} theme="patrocinio" />}

      {activeTab === 'history_entidades' && <GlobalEntitiesOverview />}
      {activeTab === 'history_entidades_dir' && <GlobalDirectory />}
      {activeTab === 'history_ec_geral' && <DirectoryECGeral />}

      {activeTab === 'history' && <Overview data={[...appData.fomentoHistorico, ...appData.patrocinioHistorico]} theme="history" showEntityCount={true} />}

      {activeTab === 'insights' && <InsightsView />}
      {activeTab === 'insights_forca' && <StateForceView />}
      {activeTab === 'insights_ec' && <InsightsECGeral />}
      {activeTab === 'insights_infra' && <InfraBRInsights />}
      {activeTab === 'ai_assistant' && <AIAssistant />}
    </>
  );
}
