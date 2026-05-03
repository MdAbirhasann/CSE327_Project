"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { ACTIVE_STATUSES } from "@/lib/order-stages";
import { isDhakaAddress } from "@/lib/address-validation";

type OrderItem = { dishId: string; quantity: number };

export async function placeOrder(
  items: OrderItem[],
  deliveryAddress: string,
  paymentMethod: string
): Promise<{ error?: string; orderId?: string }> {
  let session;
  try {
    session = await requirePermission({ order: ["create"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "You don't have permission to place orders." };
  }

  const existingActive = await prisma.order.findFirst({
    where: { customerId: session.user.id, status: { in: ACTIVE_STATUSES } },
    select: { id: true }
  });
  if (existingActive) {
    return {
      error:
        "You already have an active order. Wait for it to be delivered before placing a new one."
    };
  }

  if (!items.length) return { error: "Your cart is empty." };
  if (!deliveryAddress.trim()) return { error: "Please enter a delivery address." };
  if (!isDhakaAddress(deliveryAddress)) {
    return { error: "Sorry, we only deliver within Dhaka. Please enter a Dhaka address." };
  }
  if (!["cash", "card"].includes(paymentMethod)) return { error: "Invalid payment method." };

  const dishIds = [...new Set(items.map((i) => i.dishId))];

  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds }, available: true },
    select: { id: true, name: true, price: true }
  });

  if (dishes.length !== dishIds.length) {
    return { error: "One or more items are no longer available. Please refresh the page." };
  }

  const dishMap = new Map(dishes.map((d) => [d.id, d]));

  const lineItems = items.map((item) => {
    const dish = dishMap.get(item.dishId)!;
    return {
      dishId: item.dishId,
      dishName: dish.name,
      unitPrice: dish.price,
      quantity: item.quantity
    };
  });

  const total = lineItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  try {
    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        status: "pending",
        paymentMethod,
        deliveryAddress: deliveryAddress.trim(),
        total,
        items: { create: lineItems }
      }
    });
    return { orderId: order.id };
  } catch {
    return { error: "Failed to place order. Please try again." };
  }
}
