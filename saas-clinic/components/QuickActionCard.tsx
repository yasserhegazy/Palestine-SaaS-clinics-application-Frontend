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
    teal: 'hover:bg-teal-50 hover:border-teal-200 text-teal-700',
    blue: 'hover:bg-blue-50 hover:border-blue-200 text-blue-700',
    purple: 'hover:bg-purple-50 hover:border-purple-200 text-purple-700',
    orange: 'hover:bg-orange-50 hover:border-orange-200 text-orange-700',
    indigo: 'hover:bg-indigo-50 hover:border-indigo-200 text-indigo-700',
    cyan: 'hover:bg-cyan-50 hover:border-cyan-200 text-cyan-700',
    emerald: 'hover:bg-emerald-50 hover:border-emerald-200 text-emerald-700',
    amber: 'hover:bg-amber-50 hover:border-amber-200 text-amber-700',
    sky: 'hover:bg-sky-50 hover:border-sky-200 text-sky-700',
    rose: 'hover:bg-rose-50 hover:border-rose-200 text-rose-700',
  };

  const activeColorStyle = colorStyles[color] || colorStyles.teal;

  // Extract the text color class safely
  const textColorClass = activeColorStyle.split(' ').find(c => c.startsWith('text-')) || 'text-teal-700';

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 transition px-4 py-3 text-left ${activeColorStyle.replace(textColorClass, '')}`}
    >
      <span className={`text-xs font-semibold ${textColorClass}`}>
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">
        {title}
      </span>
      <span className="text-[11px] text-gray-500">
        {description}
      </span>
    </button>
  );
}
