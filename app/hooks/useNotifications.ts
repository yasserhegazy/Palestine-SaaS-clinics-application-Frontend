'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/api/notifications";
import type { NotificationItem } from "@/types/notifications";

type UseNotificationsOptions = {
  enabled?: boolean;
  pollIntervalMs?: number;
  status?: "unread" | "read";
};

export const useNotifications = ({
  enabled = true,
  pollIntervalMs = 60000,
  status,
}: UseNotificationsOptions = {}) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => items.filter((item) => item.status === "unread").length,
    [items]
  );

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(status);
      setItems(data);
    } catch (err: any) {
      console.error("Failed to load notifications", err);
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [enabled, status]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "read", readAt: new Date().toISOString() } : item
      )
    );
    try {
      await markNotificationRead(id);
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
      setError(err?.message || "Failed to mark notification as read");
      // Optionally reload to sync
      load();
    }
  }, [load]);

  const markAllRead = useCallback(async () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, status: "read", readAt: new Date().toISOString() }))
    );
    try {
      await markAllNotificationsRead();
    } catch (err: any) {
      console.error("Failed to mark all notifications as read", err);
      setError(err?.message || "Failed to mark all notifications as read");
      load();
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled || !pollIntervalMs) return;
    const id = setInterval(() => {
      load();
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [enabled, pollIntervalMs, load]);

  return {
    items,
    loading,
    error,
    unreadCount,
    refresh: load,
    markRead,
    markAllRead,
  };
};
