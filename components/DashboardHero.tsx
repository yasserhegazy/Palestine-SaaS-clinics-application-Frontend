import React, { ReactNode } from 'react';

interface DashboardHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  backgroundImage?: string;
}

export default function DashboardHero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
}: DashboardHeroProps) {
  return (
    <section className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-40 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_60%)]" />
      <div className="relative flex flex-col md:flex-row justify-between gap-4">
        <div>
          {subtitle && (
            <p className="text-xs text-teal-100 mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="text-2xl font-bold mb-1">
            {title}
          </h2>
          <p className="text-sm text-teal-100 max-w-xl">
            {description}
          </p>

          {primaryAction && (
            <div className="mt-3">
              {primaryAction}
            </div>
          )}
        </div>
        {secondaryAction && (
          <div className="self-start md:self-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm">
            {secondaryAction}
          </div>
        )}
      </div>
    </section>
  );
}
