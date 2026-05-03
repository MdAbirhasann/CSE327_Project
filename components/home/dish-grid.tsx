import { UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DISH_CATEGORIES } from "@/lib/categories";
import prisma from "@/lib/prisma";
import { DishGridClient } from "./dish-grid-client";

export async function DishGrid() {
  const rawDishes = await prisma.dish.findMany({
    where: { available: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: true
    }
  });

  const dishes = rawDishes.map((d) => ({ ...d, price: Number(d.price) }));

  const sections = DISH_CATEGORIES.map((cat) => ({
    ...cat,
    dishes: dishes.filter((d) => d.category === cat.label)
  })).filter((s) => s.dishes.length > 0);

  if (sections.length === 0) {
    return (
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MenuHeader />
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="bg-muted p-5">
              <UtensilsCrossed className="text-muted-foreground h-10 w-10" />
            </div>
            <p className="text-muted-foreground">No dishes available right now. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MenuHeader />
        </div>
      </div>
      <DishGridClient sections={sections} />
    </div>
  );
}

export function DishGridSkeleton() {
  return (
    <div className="pb-24">
      <div className="px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-10 w-48 sm:h-11" />
          <Skeleton className="mt-3 h-5 w-80 sm:w-96" />
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-center gap-5">
            <Skeleton className="h-5 w-24" />
            <div className="bg-border h-px flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuHeader() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Menu</h2>
      <p className="text-muted-foreground mt-3 max-w-xl text-sm sm:text-base">
        Handcrafted daily by our chefs — from quick bites to full meals, every dish is made fresh to
        order.
      </p>
    </>
  );
}
