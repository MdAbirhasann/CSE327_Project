import type { Metadata } from "next";
import { ChefHat } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { requirePermission } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { KitchenOrderCard, type KitchenOrder } from "./kitchen-order-card";

export const metadata: Metadata = {
  title: "Kitchen Queue | Crunch Time"
};

export default async function KitchenPage() {
  const session = await requirePermission({ kitchen: ["access"] });
  const chefId = session.user.id;

  const orderSelect = {
    id: true,
    total: true,
    createdAt: true,
    items: { select: { dishName: true, quantity: true } }
  } as const;

  const [pendingRows, inProgressRows, readyRows] = await Promise.all([
    prisma.order.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      select: orderSelect
    }),
    prisma.order.findMany({
      where: { chefId, status: { in: ["accepted", "preparing"] } },
      orderBy: { createdAt: "asc" },
      select: orderSelect
    }),
    prisma.order.findMany({
      where: { chefId, status: "ready" },
      orderBy: { createdAt: "asc" },
      select: orderSelect
    })
  ]);

  function serialize(rows: typeof pendingRows): KitchenOrder[] {
    return rows.map((o) => ({
      id: o.id,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      items: o.items
    }));
  }

  const pending = serialize(pendingRows);
  const inProgress = serialize(inProgressRows);
  const ready = serialize(readyRows);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">Kitchen Queue</span>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        <KitchenSection
          title="New Orders"
          count={pending.length}
          orders={pending}
          variant="new"
          emptyText="No new orders right now."
        />
        <KitchenSection
          title="In Progress"
          count={inProgress.length}
          orders={inProgress}
          variant="inprogress"
          emptyText="Nothing cooking yet."
        />
        <KitchenSection
          title="Ready for Pickup"
          count={ready.length}
          orders={ready}
          variant="ready"
          emptyText="No orders waiting for pickup."
        />
      </div>
    </>
  );
}

function KitchenSection({
  title,
  count,
  orders,
  variant,
  emptyText
}: {
  title: string;
  count: number;
  orders: KitchenOrder[];
  variant: "new" | "inprogress" | "ready";
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          {title}
        </h2>
        {count > 0 && (
          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
            {count}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-card flex items-center justify-center gap-3 border px-6 py-10 text-center">
          <ChefHat className="text-muted-foreground/40 h-5 w-5" />
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <KitchenOrderCard key={order.id} order={order} variant={variant} />
          ))}
        </div>
      )}
    </section>
  );
}
