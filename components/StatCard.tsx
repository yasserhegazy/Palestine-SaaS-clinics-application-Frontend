import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type ColorVariant = 'default' | 'teal' | 'blue' | 'purple' | 'amber' | 'red' | 'green';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
  icon?: LucideIcon;
  color?: ColorVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses: Record<ColorVariant, { icon: string; accent: string }> = {
  default: {
    icon: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700',
    accent: 'text-slate-600 dark:text-slate-300',
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40',
    accent: 'text-teal-600 dark:text-teal-400',
  },
  blue: {
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40',
    accent: 'text-red-600 dark:text-red-400',
  },
  green: {
    icon: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40',
    accent: 'text-green-600 dark:text-green-400',
  },
};

export default function StatCard({
  label,
  value,
  sub,
  loading = false,
  icon: Icon,
  color = 'default',
  trend,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 flex flex-col justify-between transition-colors duration-300 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold text-slate-900 dark:text-white ${Icon ? colors.accent : ''}`}>
            {loading ? (
              <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
          {sub && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {sub}
            </p>
          )}
        </div>
        
        {trend && !loading && (
          <div className={`flex items-center text-xs font-medium ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-0.5">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
