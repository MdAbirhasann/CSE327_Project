import Link from "next/link";
import { ShoppingBag, Clock, UtensilsCrossed, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { OrderProgressBar } from "@/components/dashboard/order-progress-bar";
import { getStatusLabel, STATUS_BADGE } from "@/lib/order-stages";

type ActiveOrder = {
  id: string;
  status: string;
  total: number;
  itemCount: number;
};

type RecentOrder = {
  id: string;
  status: string;
  createdAt: Date | string;
  total: number;
  itemCount: number;
};

interface CustomerOverviewProps {
  user: { name: string; createdAt: Date | string };
  availableDishCount: number;
  totalOrders: number;
  activeOrderCount: number;
  latestActiveOrder: ActiveOrder | null;
  recentOrders: RecentOrder[];
}

export function CustomerOverview({
  user,
  availableDishCount,
  totalOrders,
  activeOrderCount,
  latestActiveOrder,
  recentOrders
}: CustomerOverviewProps) {
  const firstName = user.name.split(" ")[0];
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(user.createdAt));

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customer &middot; Member since {memberSince}
        </p>
      </div>

      {latestActiveOrder && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
            Active Order
          </h2>
          <Link
            href={`/dashboard/orders/${latestActiveOrder.id}`}
            className="bg-card group hover:bg-muted/40 flex flex-col gap-3 border px-5 py-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{getStatusLabel(latestActiveOrder.status)}</p>
                <p className="text-muted-foreground text-sm">
                  {latestActiveOrder.itemCount} item{latestActiveOrder.itemCount !== 1 ? "s" : ""} ·
                  ৳{latestActiveOrder.total.toFixed(0)}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>
            <OrderProgressBar status={latestActiveOrder.status} showLabels />
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
          Your Activity
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Orders Placed"
            value={totalOrders}
            icon={ShoppingBag}
            iconBg="bg-blue-100 dark:bg-blue-950/50"
            iconClass="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Active Orders"
            value={activeOrderCount}
            icon={Clock}
            iconBg="bg-amber-100 dark:bg-amber-950/50"
            iconClass="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="Menu Items"
            value={availableDishCount}
            icon={UtensilsCrossed}
            iconBg="bg-green-100 dark:bg-green-950/50"
            iconClass="text-green-600 dark:text-green-400"
            sub="available today"
          />
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
          Quick Actions
        </h2>
        <Link
          href="/"
          className="bg-card group hover:bg-muted/50 flex items-center gap-4 border px-5 py-4 transition-colors"
        >
          <div className="bg-primary/10 shrink-0 p-3">
            <UtensilsCrossed className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Browse Menu</p>
            <p className="text-muted-foreground text-sm">
              {availableDishCount} dish{availableDishCount !== 1 ? "es" : ""} available right now
            </p>
          </div>
          <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
            Recent Orders
          </h2>
          {recentOrders.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="text-primary text-xs font-medium hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-card flex flex-col items-center justify-center gap-4 border px-6 py-14 text-center">
            <div className="bg-muted p-4">
              <ShoppingBag className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">No orders yet</p>
              <p className="text-muted-foreground text-sm">
                Your orders will appear here once you place them.
              </p>
            </div>
            <Link
              href="/"
              className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Place your first order
            </Link>
          </div>
        ) : (
          <div className="divide-y border">
            {recentOrders.map((order) => {
              const shortId = order.id.slice(-8).toUpperCase();
              const badgeClass = STATUS_BADGE[order.status] ?? STATUS_BADGE.cancelled;
              const isTerminal = ["delivered", "rejected", "cancelled"].includes(order.status);

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="hover:bg-muted/40 flex flex-col gap-3 px-5 py-3.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
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
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · ৳
                        {order.total.toFixed(0)} ·{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric"
                        }).format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </div>
                  {!isTerminal && <OrderProgressBar status={order.status} />}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
