"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Banknote, CreditCard, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart";
import { placeOrder } from "@/app/actions/order";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await placeOrder(
        items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        address,
        paymentMethod
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      clear();
      onOpenChange(false);
      toast.success("Order placed successfully!");
      router.push("/dashboard/orders");
    });
  }

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 rounded-none p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Confirm Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
                Order Summary
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.dishId} className="flex items-center gap-3">
                    <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.dishName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UtensilsCrossed className="text-muted-foreground h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.dishName}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.quantity} × ৳{item.unitPrice.toFixed(0)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      ৳{(item.unitPrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold tabular-nums">৳{total.toFixed(0)}</span>
            </div>

            <Separator />

            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isPending}
                  className="rounded-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isPending}>
                  <SelectTrigger id="payment" className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="cash">
                      <span className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        Cash on Delivery
                      </span>
                    </SelectItem>
                    <SelectItem value="card">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Card
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-none" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
