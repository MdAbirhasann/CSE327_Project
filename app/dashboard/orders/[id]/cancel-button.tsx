"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cancelOrder } from "@/app/actions/cancel-order";

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Wrong delivery address",
  "Found a better option",
  "Other"
];

export function CancelButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!reason) return;
    startTransition(async () => {
      const result = await cancelOrder(orderId, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Order cancelled.");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive/80 text-xs font-medium underline underline-offset-2 transition-colors"
      >
        Cancel order
      </button>

      <Dialog open={open} onOpenChange={isPending ? undefined : setOpen}>
        <DialogContent className="rounded-none sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Cancel this order?</DialogTitle>
            <DialogDescription className="text-xs">
              This cannot be undone. Please select a reason.
            </DialogDescription>
          </DialogHeader>

          <Select value={reason} onValueChange={setReason} disabled={isPending}>
            <SelectTrigger className="rounded-none text-sm">
              <SelectValue placeholder="Select a reason…" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {CANCEL_REASONS.map((r) => (
                <SelectItem key={r} value={r} className="text-sm">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-none"
              onClick={handleConfirm}
              disabled={!reason || isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
