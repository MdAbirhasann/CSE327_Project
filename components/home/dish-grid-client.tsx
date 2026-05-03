"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/store/cart";

type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
};

type Section = {
  id: string;
  label: string;
  dishes: Dish[];
};

export function DishGridClient({ sections }: { sections: Section[] }) {
  const [selected, setSelected] = useState<Dish | null>(null);

  return (
    <>
      {sections.map((section, i) => (
        <section
          key={section.id}
          id={section.id}
          className={cn("scroll-mt-20 px-4 pb-14 sm:px-6 lg:px-8", i === 0 ? "pt-4" : "pt-14")}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex items-center gap-5">
              <h2 className="shrink-0 text-xl font-bold tracking-[0.08em] uppercase">
                {section.label}
              </h2>
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {section.dishes.length} {section.dishes.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {section.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onSelect={() => setSelected(dish)} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <DishDetailDialog
        key={selected?.id}
        dish={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function DishCard({ dish, onSelect }: { dish: Dish; onSelect: () => void }) {
  const { items } = useCart();
  const cartItem = items.find((i) => i.dishId === dish.id);

  return (
    <button
      onClick={onSelect}
      className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-zinc-900 text-left"
    >
      {dish.imageUrl ? (
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UtensilsCrossed className="h-12 w-12 text-white/10" />
        </div>
      )}

      <div className="absolute top-3 left-3">
        <span className="bg-black/50 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-white/75 uppercase backdrop-blur-sm">
          {dish.category}
        </span>
      </div>

      {cartItem && (
        <div className="absolute top-3 right-3">
          <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center text-[10px] font-bold">
            {cartItem.quantity}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <ShoppingCart className="h-3.5 w-3.5" />
          {cartItem ? "Update" : "Add to Cart"}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
        <p className="line-clamp-2 text-sm leading-snug font-bold text-white sm:text-base">
          {dish.name}
        </p>
        <div className="mt-2">
          <span className="text-sm font-semibold text-white tabular-nums">
            ৳{dish.price.toFixed(0)}
          </span>
        </div>
      </div>
    </button>
  );
}

function DishDetailDialog({
  dish,
  open,
  onClose
}: {
  dish: Dish | null;
  open: boolean;
  onClose: () => void;
}) {
  const { items, addItem, setQuantity } = useCart();
  const cartItem = dish ? items.find((i) => i.dishId === dish.id) : undefined;

  const [qty, setQty] = useState(cartItem?.quantity ?? 1);

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  function handleAdd() {
    if (!dish) return;
    if (cartItem) {
      setQuantity(dish.id, qty);
    } else {
      addItem(
        { dishId: dish.id, dishName: dish.name, unitPrice: dish.price, imageUrl: dish.imageUrl },
        qty
      );
    }
    onClose();
  }

  if (!dish) return null;

  const lineTotal = dish.price * qty;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 rounded-none p-0 sm:max-w-md">
        {dish.imageUrl && (
          <div className="relative h-52 w-full overflow-hidden sm:h-60">
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 448px"
            />
          </div>
        )}

        <div className="p-6">
          <DialogHeader className="mb-1 space-y-1 text-left">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              {dish.category}
            </span>
            <DialogTitle className="text-xl">{dish.name}</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{dish.description}</p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center text-base font-semibold tabular-nums">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <span className="text-lg font-bold tabular-nums">৳{lineTotal.toFixed(0)}</span>
          </div>

          <Button className="mt-4 w-full rounded-none" onClick={handleAdd}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {cartItem ? "Update Cart" : "Add to Cart"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
