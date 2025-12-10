import React from 'react';
import { useRouter } from 'next/navigation';

interface QuickActionCardProps {
  label: string;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  color?: 'teal' | 'blue' | 'purple' | 'orange' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'sky' | 'rose';
}

export default function QuickActionCard({
  label,
  title,
  description,
  onClick,
  href,
  color = 'teal'
}: QuickActionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const colorStyles = {
    teal: 'hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-200 dark:hover:border-teal-700 text-teal-700 dark:text-teal-400',
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 text-blue-700 dark:text-blue-400',
    purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 text-purple-700 dark:text-purple-400',
    orange: 'hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-200 dark:hover:border-orange-700 text-orange-700 dark:text-orange-400',
    indigo: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-700 text-indigo-700 dark:text-indigo-400',
    cyan: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-700 text-cyan-700 dark:text-cyan-400',
    emerald: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-400',
    amber: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-200 dark:hover:border-amber-700 text-amber-700 dark:text-amber-400',
    sky: 'hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-200 dark:hover:border-sky-700 text-sky-700 dark:text-sky-400',
    rose: 'hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-700 text-rose-700 dark:text-rose-400',
  };

  const activeColorStyle = colorStyles[color] || colorStyles.teal;

  // Extract the text color class safely
  const textColorClass = activeColorStyle.split(' ').filter(c => c.startsWith('text-') || c.startsWith('dark:text-')).join(' ') || 'text-teal-700 dark:text-teal-400';

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80 transition px-4 py-3 text-left ${activeColorStyle.replace(/text-\S+/g, '').replace(/dark:text-\S+/g, '')}`}
    >
      <span className={`text-xs font-semibold ${textColorClass}`}>
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </span>
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {description}
      </span>
    </button>
  );
}
