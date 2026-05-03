export const ORDER_STAGES = [
  { label: "Received", icon: "/images/progress/order-received.gif" },
  { label: "Preparing", icon: "/images/progress/preparing.gif" },
  { label: "On the Way", icon: "/images/progress/picked-up.gif" },
  { label: "Delivered", icon: "/images/progress/delivered.gif" }
] as const;

export type SegmentState = "done" | "active" | "upcoming";

export function getActiveStageIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "accepted":
    case "preparing":
      return 1;
    case "ready":
    case "out_for_delivery":
      return 2;
    case "delivered":
      return 4;
    default:
      return -1;
  }
}

export function getSegmentState(idx: number, activeIdx: number): SegmentState {
  if (activeIdx === -1) return "upcoming";
  if (idx < activeIdx) return "done";
  if (idx === activeIdx) return "active";
  return "upcoming";
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Order Placed";
    case "accepted":
      return "Order Accepted";
    case "preparing":
      return "Preparing Your Order";
    case "ready":
      return "Ready for Pickup";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
    case "rejected":
      return "Order Rejected";
    case "cancelled":
      return "Order Cancelled";
    default:
      return status;
  }
}

export function getStatusDescription(status: string): string {
  switch (status) {
    case "pending":
      return "Waiting for the chef to accept your order.";
    case "accepted":
      return "The chef has accepted your order and will start preparing it shortly.";
    case "preparing":
      return "Your food is being prepared. Your rider will pick it up once it's ready.";
    case "ready":
      return "Your order is ready! The delivery rider is on their way to pick it up.";
    case "out_for_delivery":
      return "Your rider is on the way. Get ready to receive your order!";
    case "delivered":
      return "Your order has been delivered. Enjoy your meal!";
    case "rejected":
      return "The chef was unable to accept your order at this time.";
    case "cancelled":
      return "This order has been cancelled.";
    default:
      return "";
  }
}

export function getCurrentStageIcon(status: string): string {
  const idx = getActiveStageIndex(status);
  if (idx === -1) return ORDER_STAGES[0].icon;
  return ORDER_STAGES[Math.min(idx, ORDER_STAGES.length - 1)].icon;
}

export const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  ready: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  out_for_delivery: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
};

export const ACTIVE_STATUSES = ["pending", "accepted", "preparing", "ready", "out_for_delivery"];
