"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { getReorderItems } from "@/app/actions/reorder";

export function ReorderButton({ orderId }: { orderId: string }) {
  const { addItem, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReorder() {
    startTransition(async () => {
      const result = await getReorderItems(orderId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.available?.length) {
        toast.error("None of the items from this order are available anymore.");
        return;
      }

      clear();
      for (const item of result.available) {
        addItem(
          {
            dishId: item.dishId,
            dishName: item.dishName,
            unitPrice: item.unitPrice,
            imageUrl: item.imageUrl
          },
          item.quantity
        );
      }

      if (result.unavailable?.length) {
        const names = result.unavailable.join(", ");
        toast.warning(
          `${names} ${result.unavailable.length === 1 ? "is" : "are"} no longer available and was not added.`
        );
      } else {
        toast.success("Items added to cart!");
      }

      router.push("/");
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 rounded-none text-xs"
      onClick={(e) => {
        e.preventDefault();
        handleReorder();
      }}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5" />
      )}
      Reorder
    </Button>
  );
}
