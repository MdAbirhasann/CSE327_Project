import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { OrderProgressBar } from "@/components/dashboard/order-progress-bar";
import { getStatusLabel, getCurrentStageIcon } from "@/lib/order-stages";

interface ActiveOrderStripProps {
  orderId: string;
  status: string;
  total: number;
  itemCount: number;
}

export function ActiveOrderStrip({ orderId, status, total, itemCount }: ActiveOrderStripProps) {
  const icon = getCurrentStageIcon(status);
  const label = getStatusLabel(status);

  return (
    <div className="px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/dashboard/orders/${orderId}`}
          className="group border-l-primary bg-card hover:bg-muted/40 flex flex-col gap-3 border border-l-4 px-5 py-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0">
              <Image src={icon} alt={label} fill unoptimized className="object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-muted-foreground text-xs">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · ৳{total.toFixed(0)}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
          <OrderProgressBar status={status} showLabels />
        </Link>
      </div>
    </div>
  );
}
