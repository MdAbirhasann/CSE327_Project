"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STATUSES } from "@/lib/order-stages";

export function OrderPoller({ status }: { status: string }) {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ACTIVE_STATUSES.includes(status)) return;

    intervalRef.current = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, router]);

  return null;
}
