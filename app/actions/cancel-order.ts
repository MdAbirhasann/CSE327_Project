"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";

export async function cancelOrder(orderId: string, reason: string): Promise<{ error?: string }> {
  let session;
  try {
    session = await requirePermission({ order: ["cancel"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, customerId: true }
  });

  if (!order) return { error: "Order not found." };
  if (order.customerId !== session.user.id) return { error: "Not authorized." };
  if (order.status !== "pending") return { error: "Only pending orders can be cancelled." };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled", cancellationReason: reason }
  });

  return {};
}
