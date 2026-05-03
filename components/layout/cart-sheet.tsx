"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { CheckoutDialog } from "./checkout-dialog";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { items, removeItem, setQuantity, total, count } = useCart();

  function openCheckout() {
    onOpenChange(false);
    setCheckoutOpen(true);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="flex w-full flex-col gap-0 rounded-none p-0 sm:max-w-md"
          side="right"
        >
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart
              {count > 0 && (
                <span className="text-muted-foreground text-sm font-normal">
                  ({count} item{count !== 1 ? "s" : ""})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <div className="bg-muted p-4">
                <ShoppingCart className="text-muted-foreground h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-muted-foreground text-sm">
                  Add dishes from the menu to get started.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.dishId} className="flex items-start gap-3 px-5 py-4">
                      <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.dishName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UtensilsCrossed className="text-muted-foreground h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.dishName}</p>
                        <p className="text-muted-foreground text-xs tabular-nums">
                          ৳{item.unitPrice.toFixed(0)} each
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() =>
                              item.quantity <= 1
                                ? removeItem(item.dishId)
                                : setQuantity(item.dishId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => setQuantity(item.dishId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-semibold tabular-nums">
                          ৳{(item.unitPrice * item.quantity).toFixed(0)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7 rounded-none"
                          onClick={() => removeItem(item.dishId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold tabular-nums">৳{total.toFixed(0)}</span>
                </div>
                <div className="px-5 pb-5">
                  <Button className="w-full rounded-none" onClick={openCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
