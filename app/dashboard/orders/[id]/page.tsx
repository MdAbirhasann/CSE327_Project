import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, CreditCard, Banknote, Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/dal";
import prisma from "@/lib/prisma";
import {
  getStatusLabel,
  getStatusDescription,
  getCurrentStageIcon,
  STATUS_BADGE
} from "@/lib/order-stages";
import { OrderProgressBar } from "@/components/dashboard/order-progress-bar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details | Crunch Time"
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { name: true, email: true } },
      chef: { select: { name: true } },
      deliveryPerson: { select: { name: true } }
    }
  });

  if (!order) notFound();

  const isAdmin = session.user.role === "admin";
  const isOwner = order.customerId === session.user.id;
  if (!isAdmin && !isOwner) notFound();
  const stageIcon = getCurrentStageIcon(order.status);
  const statusLabel = getStatusLabel(order.status);
  const statusDesc = getStatusDescription(order.status);
  const badgeClass = STATUS_BADGE[order.status] ?? STATUS_BADGE.cancelled;
  const shortId = order.id.slice(-8).toUpperCase();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Link
          href="/dashboard/orders"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Orders
        </Link>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">#{shortId}</span>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative h-28 w-28">
            <Image src={stageIcon} alt={statusLabel} fill unoptimized className="object-contain" />
          </div>
          <span
            className={cn(
              "mt-1 px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
              badgeClass
            )}
          >
            {statusLabel}
          </span>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">{statusDesc}</p>
        </div>

        {order.status !== "rejected" && order.status !== "cancelled" && (
          <div className="mt-6">
            <OrderProgressBar status={order.status} showLabels />
          </div>
        )}

        <div className="mt-8 space-y-4">
          <section className="border">
            <div className="border-b px-5 py-3">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                Order Items
              </h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.dishName}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.quantity} × ৳{Number(item.unitPrice).toFixed(0)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    ৳{(Number(item.unitPrice) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-base font-bold tabular-nums">
                  ৳{Number(order.total).toFixed(0)}
                </span>
              </div>
            </div>
          </section>

          <section className="border">
            <div className="border-b px-5 py-3">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                Delivery Info
              </h2>
            </div>
            <div className="divide-y">
              <div className="flex items-start gap-3 px-5 py-3">
                <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground mb-0.5 text-xs">Delivery Address</p>
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                {order.paymentMethod === "cash" ? (
                  <Banknote className="text-muted-foreground h-4 w-4 shrink-0" />
                ) : (
                  <CreditCard className="text-muted-foreground h-4 w-4 shrink-0" />
                )}
                <div>
                  <p className="text-muted-foreground mb-0.5 text-xs">Payment</p>
                  <p className="text-sm">
                    {order.paymentMethod === "cash" ? "Cash on Delivery" : "Card"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground mb-0.5 text-xs">Placed</p>
                  <p className="text-sm">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(new Date(order.createdAt))}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {(order.chef || order.deliveryPerson) && (
            <section className="border">
              <div className="border-b px-5 py-3">
                <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                  Handled By
                </h2>
              </div>
              <div className="divide-y">
                {order.chef && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-muted-foreground text-sm">Chef</span>
                    <span className="text-sm font-medium">{order.chef.name}</span>
                  </div>
                )}
                {order.deliveryPerson && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-muted-foreground text-sm">Delivery</span>
                    <span className="text-sm font-medium">{order.deliveryPerson.name}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <p className="text-muted-foreground text-center text-xs">Order ID: {order.id}</p>
        </div>
      </div>
    </>
  );
}
