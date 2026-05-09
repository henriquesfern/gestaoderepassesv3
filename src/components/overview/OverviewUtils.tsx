import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export const DIMENSION_COLORS: Record<string, string> = {
  'MOBILIDADE': '#9937A8',
  'ENERGIA E CONECTIVIDADE': '#C5741D',
  'BEM-ESTAR SOCIAL E CIDADANIA': '#A73756',
  'ÁGUA': '#1F7F70',
  'SANEAMENTO BÁSICO': '#090076',
  'MEIO AMBIENTE E RESILIÊNCIA': '#4B7A0F'
};

export const getDimensionColor = (name: string, fallback: string) => {
  const normName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  for (const [key, color] of Object.entries(DIMENSION_COLORS)) {
    const normKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (normName.includes(normKey) || normKey.includes(normName)) return color;
  }
  return fallback;
};

export const getAdherenceColorClass = (percentage: number) => {
  if (percentage === 0) return "text-slate-400 bg-slate-50 border-slate-100";
  if (percentage <= 16) return "text-rose-600 bg-rose-50 border-rose-100";
  if (percentage <= 33) return "text-orange-600 bg-orange-50 border-orange-100";
  if (percentage <= 50) return "text-amber-600 bg-amber-50 border-amber-100";
  if (percentage <= 66) return "text-lime-600 bg-lime-50 border-lime-100";
  if (percentage <= 83) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  return "text-green-600 bg-green-50 border-green-100";
};

export const getSegmentColor = (index: number) => {
  const colors = [
    "bg-rose-500",    // 1ª dimensão
    "bg-orange-500",  // 2ª dimensão
    "bg-amber-500",   // 3ª dimensão
    "bg-lime-500",    // 4ª dimensão
    "bg-emerald-500", // 5ª dimensão
    "bg-green-600"    // 6ª dimensão
  ];
  return colors[index] || "bg-slate-200";
};

export const AdherenceProgressBar = ({ percentage, className }: { percentage: number, className?: string }) => {
  const litCount = Math.round((percentage / 100) * 6);
  return (
    <div className={cn("flex gap-0.5 h-1.5 w-full max-w-[100px]", className)}>
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "flex-1 rounded-full transition-all duration-500",
            i < litCount ? getSegmentColor(i) : "bg-slate-200"
          )} 
        />
      ))}
    </div>
  );
};
