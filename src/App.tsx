import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { FloatingControls } from './shared';
import { useData } from './context/DataContext';
import { Sidebar } from './app/layout/Sidebar';
import { appTheme } from './app/layout/theme';
import { getHeaderTitle, type TabId } from './app/navigation/tabs';
import { TabContent } from './app/router/TabContent';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { appData } = useData();
  console.log('Workflow V3: Carregando dados validados...');

  return (
    <div className={cn('relative min-h-screen flex h-screen overflow-hidden font-sans', appTheme.colors.bg, appTheme.colors.text)}>
      <div className="fixed top-0 right-0 z-[100] pointer-events-none w-40 h-40 overflow-hidden">
        <div className="absolute top-8 -right-14 w-64 bg-red-600 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest transform rotate-45 shadow-lg">
          Em Desenvolvimento
        </div>
      </div>

      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center px-8 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-10 shrink-0 shadow-sm">
          <h2 className="text-xl font-bold text-[#003865]">{getHeaderTitle(activeTab)}</h2>
        </header>

        <div id="scrollable-main" className="flex-1 overflow-auto p-8 relative">
          <div className="w-full max-w-[1920px] mx-auto h-full relative">
            <TabContent activeTab={activeTab} appData={appData} />
          </div>
        </div>
        <FloatingControls />
      </main>
    </div>
  );
}
