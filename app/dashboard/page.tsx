import { Suspense } from "react";
import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAuth } from "@/lib/dal";
import prisma from "@/lib/prisma";
import type { AppRole } from "@/lib/access";
import { AdminOverview } from "./admin-overview";
import { CustomerOverview } from "./customer-overview";
import { ChefOverview } from "./chef-overview";
import { DeliveryOverview } from "./delivery-overview";

export const metadata: Metadata = {
  title: "Dashboard | Crunch Time"
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const role = session.user.role as AppRole;
  const user = { name: session.user.name, createdAt: session.user.createdAt };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">Overview</span>
      </header>
      <Suspense fallback={<OverviewSkeleton role={role} />}>
        <OverviewContent role={role} user={user} userId={session.user.id} />
      </Suspense>
    </>
  );
}

async function OverviewContent({
  role,
  user,
  userId
}: {
  role: AppRole;
  user: { name: string; createdAt: Date | string };
  userId: string;
}) {
  if (role === "admin") {
    const [dishRows, userRoles, totalDishes, availableDishes] = await Promise.all([
      prisma.dish.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          category: true,
          available: true
        }
      }),
      prisma.user.findMany({ select: { role: true } }),
      prisma.dish.count(),
      prisma.dish.count({ where: { available: true } })
    ]);

    const customerCount = userRoles.filter((u) => u.role === "customer").length;
    const recentDishes = dishRows.map((d) => ({ ...d, price: Number(d.price) }));

    return (
      <AdminOverview
        user={user}
        totalDishes={totalDishes}
        availableDishes={availableDishes}
        totalUsers={userRoles.length}
        customerCount={customerCount}
        recentDishes={recentDishes}
      />
    );
  }

  if (role === "chef") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, inProgressCount, completedTodayCount, allTimeCount] = await Promise.all([
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { chefId: userId, status: { in: ["accepted", "preparing"] } } }),
      prisma.order.count({
        where: {
          chefId: userId,
          status: { in: ["ready", "out_for_delivery", "delivered"] },
          updatedAt: { gte: today }
        }
      }),
      prisma.order.count({ where: { chefId: userId } })
    ]);

    return (
      <ChefOverview
        user={user}
        pendingCount={pendingCount}
        inProgressCount={inProgressCount}
        completedTodayCount={completedTodayCount}
        allTimeCount={allTimeCount}
      />
    );
  }
  if (role === "delivery") return <DeliveryOverview user={user} />;

  const [availableDishCount, totalOrders, activeOrderRows, recentOrderRows] = await Promise.all([
    prisma.dish.count({ where: { available: true } }),
    prisma.order.count({ where: { customerId: userId } }),
    prisma.order.findMany({
      where: {
        customerId: userId,
        status: { in: ["pending", "accepted", "preparing", "ready", "out_for_delivery"] }
      },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { items: { select: { id: true } } }
    }),
    prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { select: { id: true } } }
    })
  ]);

  const latestActiveOrder = activeOrderRows[0]
    ? {
        id: activeOrderRows[0].id,
        status: activeOrderRows[0].status,
        total: Number(activeOrderRows[0].total),
        itemCount: activeOrderRows[0].items.length
      }
    : null;

  const recentOrders = recentOrderRows.map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    total: Number(o.total),
    itemCount: o.items.length
  }));

  return (
    <CustomerOverview
      user={user}
      availableDishCount={availableDishCount}
      totalOrders={totalOrders}
      activeOrderCount={activeOrderRows.length}
      latestActiveOrder={latestActiveOrder}
      recentOrders={recentOrders}
    />
  );
}

function OverviewSkeleton({ role }: { role: AppRole }) {
  const isAdmin = role === "admin";
  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-24" />
        <div className={`grid grid-cols-2 gap-4 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
      {isAdmin ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            <Skeleton className="h-3 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="mb-3 h-3 w-28" />
            <Skeleton className="h-52" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-20" />
        </div>
      )}
    </div>
  );
}
