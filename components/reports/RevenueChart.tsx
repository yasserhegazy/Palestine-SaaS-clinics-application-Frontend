import { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/api";

interface RevenueChartProps {
  language: string;
  onRateLimit?: () => void;
}

interface AnalyticsData {
  date: string;
  revenue: number;
  transactions: number;
}

export default function RevenueChart({ language, onRateLimit }: RevenueChartProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = language === "ar" ? "ar-EG" : "en-US";

  const formatCurrency = (value: number) =>
    value.toLocaleString(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const getLast7Days = () => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get("/clinic/reports/revenue-analytics", {
          // Backend expects a period filter (week/month/quarter/year)
          params: { period: "week" },
        });

        const payload = (response.data as any)?.data ?? response.data;
        const rawAnalytics =
          payload?.daily_revenue ??
          payload?.revenue_trend ??
          payload?.analytics ??
          [];
        const normalizedAnalytics = Array.isArray(rawAnalytics)
          ? rawAnalytics.map((entry: any) => ({
              date: entry.date,
              revenue: Number(entry.revenue ?? entry.total ?? 0),
              transactions: Number(entry.transactions ?? entry.count ?? 0),
            }))
          : [];

        // Ensure we have entries for each of the last 7 days (including zeros)
        const last7 = getLast7Days();
        const byDate = new Map<string, AnalyticsData>();
        normalizedAnalytics.forEach((item) => byDate.set(item.date, item));
        const filled = last7.map((date) => {
          const existing = byDate.get(date);
          return existing ?? { date, revenue: 0, transactions: 0 };
        });

        setAnalytics(filled);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          onRateLimit?.();
        } else {
          console.error("Error fetching revenue analytics:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalRevenue = analytics.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalTransactions = analytics.reduce((sum, day) => sum + (day.transactions || 0), 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {language === "ar" ? "الإيرادات الأسبوعية" : "Weekly Revenue"}
          </h3>
        </div>
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {language === "ar" ? "لا توجد بيانات إيرادات لهذه الفترة." : "No revenue data for this period."}
        </div>
      </div>
    );
  }

  const revenues = analytics.map((d) => d.revenue);
  const maxRevenue = Math.max(1, ...revenues);

  const barHeight = (revenue: number) => {
    if (maxRevenue <= 0) return 0;
    // Give every non-zero bar a 15% base height, scale the remaining 85% by revenue
    const scaled = revenue > 0 ? 15 + (revenue / maxRevenue) * 85 : 0;
    return Math.min(scaled, 100);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {language === "ar" ? "الإيرادات الأسبوعية" : "Weekly Revenue"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === "ar"
            ? `الإجمالي: ${formatCurrency(totalRevenue)} • المعاملات: ${totalTransactions}`
            : `Total: ${formatCurrency(totalRevenue)} • Transactions: ${totalTransactions}`}
        </p>
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between h-48 gap-3">
          {analytics.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <span className="text-[11px] text-slate-700 dark:text-slate-200 mb-1">
                {formatCurrency(day.revenue)}
              </span>
              <div
                className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm transition-all duration-300 hover:from-teal-600 hover:to-teal-500"
                style={{
                  height: `${barHeight(day.revenue)}%`,
                  // keep a tiny bar so zero days are still visible, but allow
                  // different heights to reflect actual revenue
                  minHeight: day.revenue > 0 ? "6px" : "2px",
                }}
                title={`${formatCurrency(day.revenue)} • ${day.transactions} ${
                  language === "ar" ? "معاملة" : "txns"
                }`}
              ></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {new Date(day.date).toLocaleDateString(locale, {
                  weekday: "short",
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {language === "ar" ? "آخر 7 أيام" : "Last 7 days"}
          </p>
        </div>
      </div>
    </div>
  );
}
