"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  PaymentMethod,
  PaymentMethodLabels,
  PaymentFormData,
} from "@/types/payment";

interface PaymentFormProps {
  consultationFee?: number;
  onPaymentDataChange: (data: PaymentFormData | null) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  consultationFee = 0,
  onPaymentDataChange,
  disabled = false,
}: PaymentFormProps) {
  const { language } = useLanguage();

  // Form state
  const [amount, setAmount] = useState<number>(consultationFee);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [exemptionReason, setExemptionReason] = useState("");
  const [collectPayment, setCollectPayment] = useState(true);
  const [prevConsultationFee, setPrevConsultationFee] = useState(consultationFee);

  // Update amount when consultationFee changes
  if (consultationFee !== prevConsultationFee) {
    setPrevConsultationFee(consultationFee);
    if (consultationFee > 0) {
      setAmount(consultationFee);
    }
  }

  // Notify parent of payment data changes
  useEffect(() => {
    if (!collectPayment) {
      onPaymentDataChange(null);
      return;
    }

    const paymentData: PaymentFormData = {
      amount,
      payment_method: paymentMethod,
      notes: notes || undefined,
    };

    // For partial payments, include amount_paid
    if (paymentMethod === "Partial") {
      paymentData.amount_paid = amountPaid;
    }

    // For exempt, include exemption reason
    if (paymentMethod === "Exempt" && exemptionReason) {
      paymentData.exemption_reason = exemptionReason;
    }

    onPaymentDataChange(paymentData);
  }, [amount, amountPaid, paymentMethod, notes, exemptionReason, collectPayment, onPaymentDataChange]);

  // Get label based on language
  const getLabel = (method: PaymentMethod) => {
    return language === "ar"
      ? PaymentMethodLabels[method].ar
      : PaymentMethodLabels[method].en;
  };

  const paymentMethods: PaymentMethod[] = ["Cash", "Later", "Partial", "Exempt"];

  return (
    <div className="space-y-4">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {language === "ar" ? "الدفع" : "Payment"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === "ar"
              ? "تحصيل الرسوم من المريض"
              : "Collect fee from patient"}
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={collectPayment}
            onChange={(e) => setCollectPayment(e.target.checked)}
            className="w-4 h-4 text-teal-600 border-slate-300 dark:border-slate-600 rounded focus:ring-teal-500 dark:bg-slate-700"
            disabled={disabled}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {language === "ar" ? "تحصيل الدفع" : "Collect Payment"}
          </span>
        </label>
      </div>

      {collectPayment && (
        <>
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {language === "ar" ? "المبلغ (₪)" : "Amount (₪)"}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              step={1}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
              placeholder={language === "ar" ? "أدخل المبلغ" : "Enter amount"}
              disabled={disabled}
            />
            {consultationFee > 0 && amount !== consultationFee && (
              <button
                type="button"
                onClick={() => setAmount(consultationFee)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mt-1"
                disabled={disabled}
              >
                {language === "ar"
                  ? `استخدم رسوم الاستشارة (₪${consultationFee})`
                  : `Use consultation fee (₪${consultationFee})`}
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {language === "ar" ? "طريقة الدفع" : "Payment Method"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  disabled={disabled}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    paymentMethod === method
                      ? method === "Cash"
                        ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-2 border-green-500"
                        : method === "Later"
                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-2 border-yellow-500"
                        : method === "Partial"
                        ? "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-2 border-orange-500"
                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-2 border-blue-500"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-500"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {getLabel(method)}
                </button>
              ))}
            </div>
          </div>

          {/* Partial Payment - Amount Paid */}
          {paymentMethod === "Partial" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === "ar" ? "المبلغ المدفوع (₪)" : "Amount Paid (₪)"}
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                min={0}
                max={amount}
                step={1}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
                placeholder={
                  language === "ar" ? "المبلغ المدفوع الآن" : "Amount paid now"
                }
                disabled={disabled}
              />
              {amount > amountPaid && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {language === "ar"
                    ? `المتبقي: ₪${amount - amountPaid}`
                    : `Remaining: ₪${amount - amountPaid}`}
                </p>
              )}
            </div>
          )}

          {/* Exemption Reason */}
          {paymentMethod === "Exempt" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === "ar" ? "سبب الإعفاء" : "Exemption Reason"}
              </label>
              <select
                value={exemptionReason}
                onChange={(e) => setExemptionReason(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
                disabled={disabled}
              >
                <option value="">
                  {language === "ar" ? "اختر السبب" : "Select reason"}
                </option>
                <option value="charity">
                  {language === "ar" ? "حالة إنسانية / صدقة" : "Humanitarian / Charity"}
                </option>
                <option value="staff_family">
                  {language === "ar" ? "أحد أفراد عائلة الموظفين" : "Staff family member"}
                </option>
                <option value="follow_up">
                  {language === "ar" ? "متابعة مجانية" : "Free follow-up"}
                </option>
                <option value="financial_hardship">
                  {language === "ar" ? "ظروف مادية صعبة" : "Financial hardship"}
                </option>
                <option value="other">
                  {language === "ar" ? "سبب آخر" : "Other reason"}
                </option>
              </select>
              {exemptionReason === "other" && (
                <input
                  type="text"
                  placeholder={
                    language === "ar"
                      ? "أدخل سبب الإعفاء"
                      : "Enter exemption reason"
                  }
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-white mt-2 transition-colors"
                  onChange={(e) => setExemptionReason(e.target.value)}
                  disabled={disabled}
                />
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {language === "ar" ? "ملاحظات الدفع" : "Payment Notes"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
              placeholder={
                language === "ar"
                  ? "ملاحظات إضافية عن الدفع (اختياري)"
                  : "Additional payment notes (optional)"
              }
              disabled={disabled}
            />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {language === "ar" ? "الإجمالي" : "Total"}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ₪{amount}
              </span>
            </div>
            {paymentMethod === "Partial" && (
              <>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {language === "ar" ? "المدفوع" : "Paid"}
                  </span>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    ₪{amountPaid}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {language === "ar" ? "المتبقي" : "Remaining"}
                  </span>
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    ₪{amount - amountPaid}
                  </span>
                </div>
              </>
            )}
            {paymentMethod === "Cash" && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {language === "ar"
                  ? "✓ سيتم تسجيل الدفع كاملاً"
                  : "✓ Payment will be recorded as complete"}
              </p>
            )}
            {paymentMethod === "Later" && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {language === "ar"
                  ? "⏳ سيتم تسجيل المبلغ كمستحق"
                  : "⏳ Amount will be recorded as pending"}
              </p>
            )}
            {paymentMethod === "Exempt" && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {language === "ar"
                  ? "🎁 سيتم إعفاء المريض من الدفع"
                  : "🎁 Patient will be exempt from payment"}
              </p>
            )}
          </div>
        </>
      )}

      {!collectPayment && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          {language === "ar"
            ? "لن يتم تحصيل الدفع مع هذا الموعد"
            : "No payment will be collected with this appointment"}
        </p>
      )}
    </div>
  );
}
