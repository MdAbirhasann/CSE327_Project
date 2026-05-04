"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ChevronsUpDown, LogOut, User, KeyRound, Sun, Moon, MonitorSmartphone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { cn, getInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";
import type { AppRole } from "@/lib/access";

const ROLE_STYLES: Record<AppRole, string> = {
  customer: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  chef: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  delivery: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  admin: "bg-primary/10 text-primary"
};

interface NavUserProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const handleSignOut = useSignOut();

  const initials = getInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-none after:hidden">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name} className="rounded-none" />
                )}
                <AvatarFallback className="rounded-none text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "min-w-64 rounded-none",
              isMobile ? "w-full" : "w-[--radix-dropdown-menu-trigger-width]"
            )}
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={14}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar className="size-10 shrink-0 rounded-none after:hidden">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name} className="rounded-none" />
                  )}
                  <AvatarFallback className="rounded-none text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
              <div
                className={cn(
                  "border-t px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase",
                  ROLE_STYLES[user.role as AppRole] ?? ROLE_STYLES.customer
                )}
              >
                {user.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" onClick={() => setOpenMobile(false)}>
                  <User className="size-4" />
                  Update Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile#passkeys" onClick={() => setOpenMobile(false)}>
                  <KeyRound className="size-4" />
                  Manage Passkeys
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile#sessions" onClick={() => setOpenMobile(false)}>
                  <MonitorSmartphone className="size-4" />
                  Manage Sessions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                  setOpenMobile(false);
                }}
                className="cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
                {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                handleSignOut();
                setOpenMobile(false);
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
