import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { guardPermission } from "@/lib/dal";
import { createDish } from "@/actions/dishes/create-dish";
import { DishForm } from "../dish-form";

export const metadata: Metadata = {
  title: "New Dish | Crunch Time"
};

export default async function NewDishPage() {
  await guardPermission({ dish: ["create"] });

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
        <span className="text-sm font-medium">New Dish</span>
      </header>
      <div className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold">Create Dish</h1>
            <p className="text-muted-foreground text-sm">Add a new dish to the menu.</p>
          </div>
          <DishForm action={createDish} />
        </div>
      </div>
    </>
  );
}
