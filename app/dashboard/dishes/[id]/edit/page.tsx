import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { guardPermission } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { updateDish } from "@/actions/dishes/update-dish";
import { DishForm } from "../../dish-form";

export const metadata: Metadata = {
  title: "Edit Dish | Crunch Time"
};

export default async function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPermission({ dish: ["update"] });
  const { id } = await params;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Link
          href="/dashboard/dishes"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Dishes
        </Link>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">Edit Dish</span>
      </header>
      <Suspense fallback={<EditDishSkeleton />}>
        <EditDishContent id={id} />
      </Suspense>
    </>
  );
}

async function EditDishContent({ id }: { id: string }) {
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) notFound();

  const serialized = {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: Number(dish.price),
    imageUrl: dish.imageUrl,
    category: dish.category,
    available: dish.available
  };

  const boundUpdateDish = updateDish.bind(null, id);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold">Edit Dish</h1>
          <p className="text-muted-foreground text-sm">Update the details for {dish.name}.</p>
        </div>
        <DishForm dish={serialized} action={boundUpdateDish} />
      </div>
    </div>
  );
}

function EditDishSkeleton() {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
