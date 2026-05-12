import type React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { appTheme } from './theme';
import { menuItems, sectionBreakAfter, type TabId } from '../navigation/tabs';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (id: TabId) => void;
}

export function Sidebar({ activeTab, onSelectTab }: SidebarProps) {
  const renderMenuItem = (id: TabId, label: string, Icon: React.ElementType, depth: number = 0) => (
    <button
      key={id}
      onClick={() => onSelectTab(id)}
      className={cn(
        'w-full flex items-center py-2 rounded-md transition-colors text-left',
        depth === 0 ? 'px-4' : depth === 1 ? 'pl-8 pr-4 text-sm' : 'pl-12 pr-4 text-sm',
        activeTab === id ? 'bg-[#002b4d] border-l-4 border-[#008f4c] text-white' : appTheme.colors.sidebarItemHover,
        activeTab !== id && depth > 0 ? 'text-slate-300' : 'text-white'
      )}
    >
      <Icon size={depth === 0 ? 20 : 16} className={cn('shrink-0', depth === 0 ? 'mr-3' : 'mr-2')} />
      <span className={cn(depth === 0 ? 'font-medium' : '')}>{label}</span>
    </button>
  );

  return (
    <aside className={cn('w-64 flex flex-col pt-6 shrink-0 z-10 relative shadow-xl overflow-y-auto overflow-x-hidden', appTheme.colors.sidebar)}>
      <div className="px-6 mb-6">
        <h1 className="font-bold text-xl tracking-tight leading-tight">Gestão de<br />Repasses</h1>
        <div className="h-1 w-12 bg-[#008f4c] mt-3"></div>
      </div>

      <nav className="flex-1 space-y-0.5 pb-4 px-3">
        {menuItems.map(item => (
          <div key={item.id}>
            {renderMenuItem(item.id, item.label, item.icon, item.depth)}
            {sectionBreakAfter.includes(item.id) && <div className="my-2 border-t border-white/10 mx-2"></div>}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto text-xs opacity-70 text-center border-t border-white/10 pt-4 shrink-0">
        Base de Dados Oficial<br />
        Fomento e Patrocínio
      </div>
    </aside>
  );
}