"use client";

import ProtectedLayout from "@/components/ProtectedLayout";
import type { ReactNode } from "react";

export default function ReceptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
