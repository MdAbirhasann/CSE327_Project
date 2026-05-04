import type { Metadata } from "next";
import { Bike } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { guardPermission } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { DeliveryOrderCard, type DeliveryOrder } from "./delivery-order-card";

export const metadata: Metadata = {
  title: "Deliveries | Crunch Time"
};

export default async function DeliveriesPage() {
  const session = await guardPermission({ deliveryQueue: ["access"] });
  const deliveryPersonId = session.user.id;

  const orderSelect = {
    id: true,
    total: true,
    createdAt: true,
    deliveryAddress: true,
    items: { select: { dishName: true, quantity: true } }
  } as const;

  const [readyRows, activeRows, doneRows] = await Promise.all([
    prisma.order.findMany({
      where: { status: "ready" },
      orderBy: { createdAt: "asc" },
      select: orderSelect
    }),
    prisma.order.findMany({
      where: { deliveryPersonId, status: "out_for_delivery" },
      orderBy: { createdAt: "asc" },
      select: orderSelect
    }),
    prisma.order.findMany({
      where: { deliveryPersonId, status: "delivered" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: orderSelect
    })
  ]);

  function serialize(rows: typeof readyRows): DeliveryOrder[] {
    return rows.map((o) => ({
      id: o.id,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      deliveryAddress: o.deliveryAddress,
      items: o.items
    }));
  }

  const ready = serialize(readyRows);
  const active = serialize(activeRows);
  const done = serialize(doneRows);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">Deliveries</span>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        <DeliverySection
          title="Ready for Pickup"
          count={ready.length}
          orders={ready}
          variant="ready"
          emptyText="No orders ready for pickup yet."
        />
        <DeliverySection
          title="Out for Delivery"
          count={active.length}
          orders={active}
          variant="active"
          emptyText="Nothing out for delivery."
        />
        <DeliverySection
          title="Delivered"
          count={done.length}
          orders={done}
          variant="done"
          emptyText="No deliveries completed yet."
        />
      </div>
    </>
  );
}

function DeliverySection({
  title,
  count,
  orders,
  variant,
  emptyText
}: {
  title: string;
  count: number;
  orders: DeliveryOrder[];
  variant: "ready" | "active" | "done";
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
          <Bike className="text-muted-foreground/40 h-5 w-5" />
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <DeliveryOrderCard key={order.id} order={order} variant={variant} />
          ))}
        </div>
      )}
    </section>
  );
}
