interface PaymentSummaryCardProps {
  paidPayments: number;
  pendingPayments: number;
  totalPayments: number;
  language: string;
}

export default function PaymentSummaryCard({
  paidPayments,
  pendingPayments,
  totalPayments,
  language
}: PaymentSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {language === "ar" ? "ملخص المدفوعات" : "Payment Summary"}
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {language === "ar" ? "مدفوع بالكامل" : "Fully Paid"}
          </span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {paidPayments || 0}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {language === "ar" ? "معلق/جزئي" : "Pending/Partial"}
          </span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {pendingPayments || 0}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {language === "ar" ? "إجمالي المعاملات" : "Total Transactions"}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {totalPayments || 0}
          </span>
        </div>
      </div>
    </div>
  );
}