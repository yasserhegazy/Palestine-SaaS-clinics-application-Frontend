'use client';

import apiClient from "@/lib/api";
import type { NotificationItem, NotificationStatus } from "@/types/notifications";

type RawNotification =
  | {
      // Laravel database notification format
      id: string;
      data: Record<string, any>;
      read_at: string | null;
      created_at: string;
    }
  | {
      // API resource shape we return from backend
      id: string;
      title?: string;
      body?: string;
      category?: string;
      cta?: { label?: string; path?: string; url?: string };
      payload?: Record<string, any>;
      read_at?: string | null;
      created_at: string;
    };

type NotificationListResponse = {
  success: boolean;
  data: RawNotification[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const mapNotification = (raw: RawNotification): NotificationItem => {
  const fromResource = "title" in raw;
  const data = fromResource ? raw.payload ?? {} : (raw as any).data ?? {};
  const title = fromResource ? (raw as any).title : data.title;
  const body = fromResource ? (raw as any).body : data.body;
  const category = fromResource ? (raw as any).category : data.category;
  const cta = fromResource ? (raw as any).cta : data.cta;
  const read_at = (raw as any).read_at ?? null;
  const created_at = (raw as any).created_at;

  const status: NotificationStatus = read_at ? "read" : "unread";

  return {
    id: (raw as any).id,
    title: title ?? "Notification",
    body: body ?? "",
    category: category ?? "other",
    actionLabel: cta?.label,
    href: cta?.path ?? cta?.url,
    createdAt: created_at,
    readAt: read_at,
    status,
    payload: data,
  };
};

export const fetchNotifications = async (
  status?: "unread" | "read",
  perPage = 20
): Promise<NotificationItem[]> => {
  const params: Record<string, string | number> = { per_page: perPage };
  if (status) params.status = status;

  const res = await apiClient.get<NotificationListResponse>("/notifications", {
    params,
  });

  const data = (res.data as any).data ?? [];
  return data.map(mapNotification);
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await apiClient.post(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.post("/notifications/read-all");
};
