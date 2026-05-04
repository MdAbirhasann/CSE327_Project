"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";

export async function pickupOrder(orderId: string): Promise<{ error?: string }> {
  let session;
  try {
    session = await requirePermission({ deliveryQueue: ["access"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true }
  });

  if (!order || order.status !== "ready") {
    return { error: "Order is no longer available for pickup." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "out_for_delivery", deliveryPersonId: session.user.id }
  });

  return {};
}

export async function markDelivered(orderId: string): Promise<{ error?: string }> {
  let session;
  try {
    session = await requirePermission({ deliveryQueue: ["access"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, deliveryPersonId: true }
  });

  if (!order || order.status !== "out_for_delivery") {
    return { error: "Order cannot be marked as delivered." };
  }

  if (order.deliveryPersonId !== session.user.id) {
    return { error: "This order is not assigned to you." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "delivered" }
  });

  return {};
}
