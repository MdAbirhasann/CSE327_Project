"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";

export async function acceptOrder(orderId: string): Promise<{ error?: string }> {
  let session;
  try {
    session = await requirePermission({ kitchen: ["access"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true }
  });

  if (!order || order.status !== "pending") {
    return { error: "Order is no longer available." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "preparing", chefId: session.user.id }
  });

  return {};
}

export async function rejectOrder(orderId: string): Promise<{ error?: string }> {
  try {
    await requirePermission({ kitchen: ["access"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true }
  });

  if (!order || order.status !== "pending") {
    return { error: "Order is no longer available." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "rejected" }
  });

  return {};
}

export async function markReady(orderId: string): Promise<{ error?: string }> {
  let session;
  try {
    session = await requirePermission({ kitchen: ["access"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, chefId: true }
  });

  if (!order || !["accepted", "preparing"].includes(order.status)) {
    return { error: "Order cannot be marked ready." };
  }

  if (order.chefId !== session.user.id) {
    return { error: "This order is not assigned to you." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ready" }
  });

  return {};
}
