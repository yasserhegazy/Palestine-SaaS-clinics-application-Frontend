export type NotificationStatus = "unread" | "read";

export type NotificationCategory =
  | "appointment"
  | "reminder"
  | "message"
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
}
