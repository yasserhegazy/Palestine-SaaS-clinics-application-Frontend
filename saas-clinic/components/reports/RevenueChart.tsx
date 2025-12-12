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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/clinic/reports/revenue-analytics', {
          params: { days: 7 }
        });
        setAnalytics(response.data.analytics || []);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          onRateLimit?.();
        } else {
          console.error('Error fetching revenue analytics:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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

  const maxRevenue = Math.max(...analytics.map(d => d.revenue), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {language === "ar" ? "الإيرادات الأسبوعية" : "Weekly Revenue"}
        </h3>
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between h-32 gap-2">
          {analytics.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm transition-all duration-300 hover:from-teal-600 hover:to-teal-500"
                style={{ 
                  height: `${(day.revenue / maxRevenue) * 100}%`,
                  // keep a tiny bar so zero days are still visible
                  minHeight: '4px'
                }}
                title={`$${day.revenue.toFixed(2)}`}
              ></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {new Date(day.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { 
                  weekday: 'short' 
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
