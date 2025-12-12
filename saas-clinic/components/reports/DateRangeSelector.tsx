interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  language: string;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  language
}: DateRangeSelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
        {language === "ar" ? "الفترة الزمنية" : "Date Range"}
      </label>
      <div className="flex gap-3">
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => onStartDateChange(e.target.value)} 
          className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
        />
        <span className="self-center text-slate-500">
          {language === "ar" ? "إلى" : "to"}
        </span>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => onEndDateChange(e.target.value)} 
          max={new Date().toISOString().split('T')[0]} 
          className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
        />
      </div>
    </div>
  );
}