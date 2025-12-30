import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
  textColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  textColor = "text-slate-900 dark:text-white"
}: StatCardProps) {
  const cardClass = gradient 
    ? `bg-gradient-to-br ${gradient} text-white shadow-lg`
    : "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700";

  return (
    <div className={`rounded-2xl p-5 ${cardClass}`}>
      {gradient ? (
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-8 h-8 opacity-80" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
            {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
          </div>
        </div>
      )}
      
      {gradient && (
        <>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}