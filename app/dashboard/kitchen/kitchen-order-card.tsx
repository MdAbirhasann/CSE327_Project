"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { acceptOrder, rejectOrder, markReady } from "@/app/actions/chef";

export type KitchenOrder = {
  id: string;
  total: number;
  createdAt: string;
  items: Array<{ dishName: string; quantity: number }>;
};

type Variant = "new" | "inprogress" | "ready";

interface KitchenOrderCardProps {
  order: KitchenOrder;
  variant: Variant;
}

export function KitchenOrderCard({ order, variant }: KitchenOrderCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const shortId = order.id.slice(-8).toUpperCase();
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(order.createdAt));

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  function run(action: () => Promise<{ error?: string }>, type: string) {
    setActiveAction(type);
    startTransition(async () => {
      const result = await action();
      setActiveAction(null);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-3 border px-5 py-4",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">#{shortId}</span>
        <span className="text-muted-foreground text-xs">{time}</span>
      </div>

      <div className="space-y-1">
        {order.items.map((item, i) => (
          <p key={i} className="text-sm">
            {item.dishName} <span className="text-muted-foreground">× {item.quantity}</span>
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <p className="text-muted-foreground text-xs">
          {totalItems} item{totalItems !== 1 ? "s" : ""} · ৳{order.total.toFixed(0)}
        </p>

        {variant === "new" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => run(() => rejectOrder(order.id), "reject")}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10 border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => run(() => acceptOrder(order.id), "accept")}
              disabled={isPending}
              className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
            >
              {activeAction === "accept" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Accept &amp; Cook
            </button>
          </div>
        )}

        {variant === "inprogress" && (
          <button
            onClick={() => run(() => markReady(order.id), "ready")}
            disabled={isPending}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
          >
            {activeAction === "ready" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Mark as Ready
          </button>
        )}

        {variant === "ready" && (
          <span className="bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-700 uppercase dark:bg-cyan-900/40 dark:text-cyan-400">
            Waiting for pickup
          </span>
        )}
      </div>
    </div>
  );
}
