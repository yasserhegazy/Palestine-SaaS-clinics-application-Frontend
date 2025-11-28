import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  sub,
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
      <p className="text-xs text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900">
        {loading ? "..." : value}
      </p>
      {sub && (
        <p className="mt-1 text-[11px] text-slate-500">
          {sub}
        </p>
      )}
    </div>
  );
}
