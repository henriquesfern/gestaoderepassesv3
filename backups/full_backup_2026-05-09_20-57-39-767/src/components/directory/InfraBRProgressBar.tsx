import React from 'react';
import { cn, getSegmentColor } from './DirectoryUtils';

export const InfraBRProgressBar = ({ count, className }: { count: number, className?: string }) => {
  const safeCount = Math.min(Math.max(0, count), 6);
  
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex gap-1 h-2 w-full">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "flex-1 h-full rounded-sm transition-all duration-300",
              i < safeCount ? getSegmentColor(i) : "bg-slate-200"
            )} 
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Aderência Infra-BR</span>
        <span className={cn("px-1 rounded", safeCount < 3 ? "text-rose-600" : "text-emerald-600")}>
          {safeCount}/6 Dimensões
        </span>
      </div>
    </div>
  );
};
