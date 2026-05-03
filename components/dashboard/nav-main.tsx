"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, ChefHat, Truck, Users } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import type { AppRole } from "@/lib/access";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const customerNav: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Menu", url: "/", icon: UtensilsCrossed },
  { title: "My Orders", url: "/dashboard/orders", icon: ShoppingBag }
];

const chefNav: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Kitchen Queue", url: "/dashboard/kitchen", icon: ChefHat }
];

const deliveryNav: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Deliveries", url: "/dashboard/deliveries", icon: Truck }
];

const adminNav: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Dishes", url: "/dashboard/dishes", icon: UtensilsCrossed },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Users", url: "/dashboard/users", icon: Users }
];

const navByRole: Record<AppRole, NavItem[]> = {
  customer: customerNav,
  chef: chefNav,
  delivery: deliveryNav,
  admin: adminNav
};

export function NavMain({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = navByRole[role] ?? customerNav;
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu className={"gap-1"}>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
              <Link href={item.url} onClick={() => setOpenMobile(false)}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
