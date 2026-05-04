"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickupOrder, markDelivered } from "@/app/actions/delivery";

export type DeliveryOrder = {
  id: string;
  total: number;
  createdAt: string;
  deliveryAddress: string;
  items: Array<{ dishName: string; quantity: number }>;
};

type Variant = "ready" | "active" | "done";

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  variant: Variant;
}

export function DeliveryOrderCard({ order, variant }: DeliveryOrderCardProps) {
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

      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{order.deliveryAddress}</span>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <p className="text-muted-foreground text-xs">
          {totalItems} item{totalItems !== 1 ? "s" : ""} · ৳{order.total.toFixed(0)}
        </p>

        {variant === "ready" && (
          <button
            onClick={() => run(() => pickupOrder(order.id), "pickup")}
            disabled={isPending}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
          >
            {activeAction === "pickup" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Pick Up
          </button>
        )}

        {variant === "active" && (
          <button
            onClick={() => run(() => markDelivered(order.id), "delivered")}
            disabled={isPending}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
          >
            {activeAction === "delivered" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Mark Delivered
          </button>
        )}

        {variant === "done" && (
          <span className="bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-900/40 dark:text-emerald-400">
            Delivered
          </span>
        )}
      </div>
    </div>
  );
}
