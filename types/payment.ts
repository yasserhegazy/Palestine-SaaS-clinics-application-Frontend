// Payment method types
export type PaymentMethod = 'Cash' | 'Later' | 'Partial' | 'Exempt';

// Payment status types
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Exempt' | 'Refunded';

// Arabic translations for payment methods
export const PaymentMethodLabels: Record<PaymentMethod, { en: string; ar: string }> = {
  Cash: { en: 'Cash', ar: 'نقداً' },
  Later: { en: 'Pay Later', ar: 'دفع لاحقاً' },
  Partial: { en: 'Partial Payment', ar: 'دفعة جزئية' },
  Exempt: { en: 'Exemption', ar: 'إعفاء' },
};

// Arabic translations for payment statuses
export const PaymentStatusLabels: Record<PaymentStatus, { en: string; ar: string }> = {
  Paid: { en: 'Paid', ar: 'مدفوع' },
  Pending: { en: 'Pending', ar: 'قيد الانتظار' },
  Partial: { en: 'Partial', ar: 'جزئي' },
  Exempt: { en: 'Exempt', ar: 'معفى' },
  Refunded: { en: 'Refunded', ar: 'مسترد' },
};

// Status colors for UI
export const PaymentStatusColors: Record<PaymentStatus, string> = {
  Paid: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Partial: 'bg-orange-100 text-orange-800',
  Exempt: 'bg-blue-100 text-blue-800',
  Refunded: 'bg-gray-100 text-gray-800',
};

// Payment interface
export interface Payment {
  payment_id: number;
  appointment_id: number;
  patient_id: number;
  clinic_id: number;
  received_by: number;
  amount: number;
  amount_paid: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string | null;
  receipt_number: string;
  notes: string | null;
  exemption_reason: string | null;
  created_at: string;
  updated_at: string;
  // Relationships
  patient?: {
    patient_id: number;
    user: {
      user_id: number;
      name: string;
      email: string;
    };
  };
  appointment?: {
    appointment_id: number;
    appointment_date: string;
    appointment_time: string;
    doctor?: {
      doctor_id: number;
      user: {
        name: string;
      };
    };
  };
  receiver?: {
    user_id: number;
    name: string;
  };
}

// Payment form data for creating payments
export interface PaymentFormData {
  amount: number;
  amount_paid?: number;
  payment_method: PaymentMethod;
  notes?: string;
  exemption_reason?: string;
}

// Payment creation request
export interface CreatePaymentRequest {
  appointment_id: number;
  amount: number;
  amount_paid?: number;
  payment_method: PaymentMethod;
  notes?: string;
  exemption_reason?: string;
}

// Payment update request
export interface UpdatePaymentRequest {
  amount_paid?: number;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  notes?: string;
}

// Payment response
export interface PaymentResponse {
  message: string;
  payment: Payment;
  receipt_number?: string;
}

// Payments list response (paginated)
export interface PaymentsListResponse {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Pending payments response
export interface PendingPaymentsResponse {
  payments: Payment[];
  total_pending: number;
  count: number;
}

// Daily report summary
export interface DailyReportSummary {
  date: string;
  total_collected: number;
  total_partial: number;
  total_exempt: number;
  total_pending: number;
  cash_count: number;
  exempt_count: number;
  total_transactions: number;
}

// Daily report by receiver
export interface ReceiverReport {
  receiver_name: string;
  total_collected: number;
  transaction_count: number;
}

// Daily report response
export interface DailyReportResponse {
  summary: DailyReportSummary;
  by_receiver: ReceiverReport[];
  payments: Payment[];
}

// Patient payment history summary
export interface PatientPaymentSummary {
  total_paid: number;
  total_pending: number;
  total_exempt: number;
  total_visits: number;
}

// Patient payment history response
export interface PatientPaymentHistoryResponse {
  patient: {
    patient_id: number;
    name: string;
  };
  summary: PatientPaymentSummary;
  payments: Payment[];
}
