interface CollectionRateCardProps {
  paidPayments: number;
  totalPayments: number;
  language: string;
}

export default function CollectionRateCard({
  paidPayments,
  totalPayments,
  language
}: CollectionRateCardProps) {
  const collectionRate = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {language === "ar" ? "نسبة التحصيل" : "Collection Rate"}
        </h3>
      </div>
      <div className="p-5">
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-teal-600 dark:text-teal-400">
            {collectionRate}%
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {language === "ar" ? "من المدفوعات تم تحصيلها بالكامل" : "of payments fully collected"}
          </p>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}