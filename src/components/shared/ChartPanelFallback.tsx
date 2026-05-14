import React from 'react';

interface ChartPanelFallbackProps {
  className?: string;
  heightClassName?: string;
}

export function ChartPanelFallback({
  className = 'bg-white border border-slate-200 shadow-sm p-6',
  heightClassName = 'h-64',
}: ChartPanelFallbackProps) {
  return (
    <div className={className}>
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-6">
        <div className={`${heightClassName} animate-pulse rounded-xl bg-slate-100`} />
      </div>
    </div>
  );
}
