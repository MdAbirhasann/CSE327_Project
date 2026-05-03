import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAuth } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { getStatusLabel, STATUS_BADGE } from "@/lib/order-stages";
import { OrderProgressBar } from "@/components/dashboard/order-progress-bar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders | Crunch Time"
};

export default async function OrdersPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "admin";

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">{isAdmin ? "Orders" : "My Orders"}</span>
      </header>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent userId={session.user.id} isAdmin={isAdmin} />
      </Suspense>
    </>
  );
}

async function OrdersContent({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const orders = await prisma.order.findMany({
    where: isAdmin ? undefined : { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true } },
      customer: isAdmin ? { select: { name: true } } : undefined
    }
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <div className="bg-muted p-5">
          <ShoppingBag className="text-muted-foreground h-9 w-9" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="text-muted-foreground text-sm">
            {isAdmin ? "No orders have been placed yet." : "Place your first order from the menu."}
          </p>
        </div>
        {!isAdmin && (
          <Link
            href="/"
            className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Browse Menu
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {orders.map((order) => {
        const shortId = order.id.slice(-8).toUpperCase();
        const badgeClass = STATUS_BADGE[order.status] ?? STATUS_BADGE.cancelled;
        const isTerminal = ["delivered", "rejected", "cancelled"].includes(order.status);

        return (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="hover:bg-muted/40 flex flex-col gap-3 px-6 py-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">#{shortId}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      badgeClass
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ৳
                  {Number(order.total).toFixed(0)} ·{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  }).format(new Date(order.createdAt))}
                </p>
                {isAdmin && "customer" in order && order.customer && (
                  <p className="text-muted-foreground mt-0.5 text-xs">by {order.customer.name}</p>
                )}
              </div>
              <ChevronRight className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            </div>
            {!isTerminal && <OrderProgressBar status={order.status} />}
          </Link>
        );
      })}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-2 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
