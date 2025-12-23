"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Clock3, Inbox } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { NotificationItem } from "@/types/notifications";

interface NotificationBellProps {
  items: NotificationItem[];
  onMarkAllRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
}

const formatTimeFromNow = (createdAt: string, isArabic: boolean) => {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return createdAt;
  }

  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return isArabic ? "الآن" : "just now";
  if (diffMinutes < 60)
    return isArabic ? `قبل ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
  if (diffHours < 24)
    return isArabic ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
  return isArabic ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
};

export default function NotificationBell({
  items,
  onMarkAllRead,
  onItemClick,
}: NotificationBellProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = useMemo(
    () => items.filter((item) => item.status === "unread").length,
    [items]
  );
  const showBadge = unreadCount > 0;

  const labels = {
    title: isArabic ? "الإشعارات" : "Notifications",
    markAll: isArabic ? "تعيين الكل كمقروء" : "Mark all read",
    empty: isArabic ? "لا توجد إشعارات جديدة" : "No new notifications",
    view: isArabic ? "عرض التفاصيل" : "View details",
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  const badgeColor = showBadge ? "bg-teal-500" : "bg-slate-300";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label={labels.title}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        {showBadge && (
          <span
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-semibold text-white flex items-center justify-center shadow ${badgeColor}`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute mt-3 w-80 sm:w-96 ${
            isArabic ? "left-0" : "right-0"
          } z-30 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {labels.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount}{" "}
                  {isArabic ? "غير مقروءة" : "unread"}
                </p>
              </div>
            </div>
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 transition-colors disabled:opacity-50"
              disabled={!unreadCount}
            >
              <Check className="w-4 h-4" />
              {labels.markAll}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-900">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{labels.empty}</p>
              </div>
            ) : (
              items.map((item) => {
                const isUnread = item.status === "unread";
                const accent =
                  item.category === "appointment"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : item.category === "reminder"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : item.category === "message"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-slate-200 dark:border-slate-700";

                return (
                  <button
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                      isUnread ? "bg-slate-50/80 dark:bg-slate-900/50" : ""
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl border flex items-center justify-center text-slate-700 dark:text-slate-200 ${accent}`}
                    >
                      <Clock3 className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.body}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatTimeFromNow(item.createdAt, isArabic)}</span>
                        {item.actionLabel && (
                          <span className="text-teal-700 dark:text-teal-300 font-medium">
                            {item.actionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
