"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";

type ReorderItem = {
  dishId: string;
  dishName: string;
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
};

export async function getReorderItems(orderId: string): Promise<{
  error?: string;
  available?: ReorderItem[];
  unavailable?: string[];
}> {
  let session;
  try {
    session = await requirePermission({ order: ["view"] });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "Not authorized." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      customerId: true,
      items: { select: { dishId: true, dishName: true, quantity: true } }
    }
  });

  if (!order) return { error: "Order not found." };
  if (order.customerId !== session.user.id) return { error: "Not authorized." };

  const dishIds = order.items.filter((i) => i.dishId).map((i) => i.dishId!);

  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds }, available: true },
    select: { id: true, name: true, price: true, imageUrl: true }
  });

  const availableIds = new Set(dishes.map((d) => d.id));
  const dishMap = new Map(dishes.map((d) => [d.id, d]));

  const available: ReorderItem[] = order.items
    .filter((i) => i.dishId && availableIds.has(i.dishId))
    .map((i) => {
      const dish = dishMap.get(i.dishId!)!;
      return {
        dishId: i.dishId!,
        dishName: dish.name,
        unitPrice: Number(dish.price),
        imageUrl: dish.imageUrl,
        quantity: i.quantity
      };
    });

  const unavailable = order.items
    .filter((i) => !i.dishId || !availableIds.has(i.dishId!))
    .map((i) => i.dishName);

  return { available, unavailable };
}
