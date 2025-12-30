"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { isDark, toggleDark } = useTheme();

  return (
    <button
      onClick={toggleDark}
      className="relative p-2 rounded-lg transition-all duration-300 
                 bg-slate-100 dark:bg-slate-700 
                 hover:bg-slate-200 dark:hover:bg-slate-600
                 text-slate-600 dark:text-slate-300
                 border border-slate-200 dark:border-slate-600"
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي"}
      title={isDark ? "الوضع الفاتح" : "الوضع الليلي"}
    >
      <div className="relative w-5 h-5">
        {/* أيقونة الشمس */}
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform
                     ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
                     text-amber-500`}
        />
        {/* أيقونة القمر */}
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform
                     ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
                     text-blue-400`}
        />
      </div>
    </button>
  );
}
