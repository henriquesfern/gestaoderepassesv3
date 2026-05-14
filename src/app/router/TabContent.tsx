import React, { Suspense, lazy } from 'react';
import { type AppData } from '../../context/DataContext';
import { type TabId } from '../navigation/tabs';

const Overview = lazy(async () => {
  const module = await import('../../features/overview');
  return { default: module.Overview };
});

const GlobalEntitiesOverview = lazy(async () => {
  const module = await import('../../features/overview');
  return { default: module.GlobalEntitiesOverview };
});

const Directory = lazy(async () => {
  const module = await import('../../features/directory');
  return { default: module.Directory };
});

const GlobalDirectory = lazy(async () => {
  const module = await import('../../features/directory');
  return { default: module.GlobalDirectory };
});

const DirectoryECGeral = lazy(async () => {
  const module = await import('../../features/directory');
  return { default: module.DirectoryECGeral };
});

const FinancialPanel = lazy(async () => {
  const module = await import('../../features/financial');
  return { default: module.FinancialPanel };
});

const FiscalView = lazy(async () => {
  const module = await import('../../features/fiscal');
  return { default: module.FiscalView };
});

const InsightsView = lazy(async () => {
  const module = await import('../../features/insights');
  return { default: module.InsightsView };
});

const StateForceView = lazy(async () => {
  const module = await import('../../features/insights');
  return { default: module.StateForceView };
});

const InsightsECGeral = lazy(async () => {
  const module = await import('../../features/insights');
  return { default: module.InsightsECGeral };
});

const AIAssistant = lazy(async () => {
  const module = await import('../../features/ai');
  return { default: module.AIAssistant };
});

const InfraBRInsights = lazy(async () => {
  const module = await import('../../features/infra');
  return { default: module.InfraBRInsights };
});

interface TabContentProps {
  activeTab: TabId;
  appData: AppData;
}

export function TabContent({ activeTab, appData }: TabContentProps) {
  return (
    <Suspense fallback={<TabLoadingState />}>
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
    </Suspense>
  );
}

function TabLoadingState() {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
