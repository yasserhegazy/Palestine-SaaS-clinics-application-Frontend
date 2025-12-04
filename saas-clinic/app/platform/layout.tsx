"use client";

import ProtectedLayout from "@/components/ProtectedLayout";
import type { ReactNode } from "react";

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
