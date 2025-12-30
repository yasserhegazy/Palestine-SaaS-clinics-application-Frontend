export type NotificationStatus = "unread" | "read";

export type NotificationCategory =
  | "appointment"
  | "appointment_request"
  | "reminder"
  | "message"
  | "today_schedule"
  | "system"
  | "other";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  status: NotificationStatus;
  category?: NotificationCategory;
  actionLabel?: string;
  href?: string;
  payload?: Record<string, unknown>;
  readAt?: string | null;
}
