import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { DishGrid, DishGridSkeleton } from "@/components/home/dish-grid";
import { ActiveOrderStrip } from "@/components/home/active-order-strip";
import { getSession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { ACTIVE_STATUSES } from "@/lib/order-stages";

export const metadata: Metadata = {
  title: "Crunch Time — Fresh food, delivered fast",
  description: "Restaurant-quality meals made by expert chefs, brought straight to your door."
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <ActiveOrderSection />
      </Suspense>
      <Suspense fallback={<DishGridSkeleton />}>
        <DishGrid />
      </Suspense>
    </>
  );
}

async function ActiveOrderSection() {
  const session = await getSession();
  if (!session) return null;

  const order = await prisma.order.findFirst({
    where: {
      customerId: session.user.id,
      status: { in: ACTIVE_STATUSES }
    },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } }
  });

  if (!order) return null;

  return (
    <ActiveOrderStrip
      orderId={order.id}
      status={order.status}
      total={Number(order.total)}
      itemCount={order.items.length}
    />
  );
}
