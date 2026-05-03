"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import Link from "next/link";
import {
  Soup,
  CookingPot,
  Cookie,
  IceCreamCone,
  Wine,
  Store,
  ShoppingCart,
  Menu,
  LogIn,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useCart } from "@/store/cart";
import { CartSheet } from "@/components/layout/cart-sheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoMark, LogoWordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { type AppRole } from "@/lib/access";
import { cn, getInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-sign-out";

const ROLE_STYLES: Record<AppRole, string> = {
  customer: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  chef: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  delivery: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  admin: "bg-primary/10 text-primary"
};

const ROLE_LABELS: Record<AppRole, string> = {
  customer: "Customer",
  chef: "Chef",
  delivery: "Delivery",
  admin: "Admin"
};

function RoleBadge({ role }: { role: string }) {
  const key = (role ?? "customer") as AppRole;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        ROLE_STYLES[key] ?? ROLE_STYLES.customer
      )}
    >
      {ROLE_LABELS[key] ?? role}
    </span>
  );
}

const NAV_ITEMS = [
  { label: "Rice", icon: Soup, href: "/#rice" },
  { label: "Curry", icon: CookingPot, href: "/#curry" },
  { label: "Snacks", icon: Cookie, href: "/#snacks" },
  { label: "Desserts", icon: IceCreamCone, href: "/#desserts" },
  { label: "Drinks", icon: Wine, href: "/#drinks" },
  { label: "Street Food", icon: Store, href: "/#street-food" }
];

function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const handleSignOut = useSignOut();

  if (isPending) {
    return <Skeleton className="size-7 rounded-none" />;
  }

  if (session?.user) {
    const initials = getInitials(session.user.name);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="border-border/60 ring-ring/30 hover:ring-ring/60 cursor-pointer overflow-hidden border p-0 ring-1 ring-offset-1 ring-offset-transparent transition-shadow"
          >
            <Avatar className="size-full rounded-none after:rounded-none">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
                className="rounded-none"
              />
              <AvatarFallback className="rounded-none text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background w-52">
          <DropdownMenuLabel className="font-normal">
            <div className="mb-1.5">
              <RoleBadge role={session.user.role ?? "customer"} />
            </div>
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{session.user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer gap-2"
          >
            <LogOut className="size-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="border-border/60 hidden gap-1.5 border sm:flex"
      asChild
    >
      <Link href="/sign-in">
        <LogIn className="size-3.5" />
        Sign In
      </Link>
    </Button>
  );
}

function MobileAuthSection() {
  const { data: session, isPending } = authClient.useSession();
  const handleSignOut = useSignOut();

  if (isPending) {
    return <Skeleton className="h-9 w-full rounded-none" />;
  }

  if (session?.user) {
    const initials = getInitials(session.user.name);

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="size-7 shrink-0 rounded-none after:rounded-none">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "User"}
              className="rounded-none"
            />
            <AvatarFallback className="rounded-none text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="mb-0.5">
              <RoleBadge role={session.user.role ?? "customer"} />
            </div>
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{session.user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" className="w-full gap-2" asChild>
      <Link href="/sign-in">
        <LogIn className="size-4" />
        Sign In
      </Link>
    </Button>
  );
}

export function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="border-border/50 bg-background/80 fixed inset-x-0 top-0 z-50 h-16 border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-6 w-auto" />
          <LogoWordmark className="mt-0.5 hidden h-3.5 w-auto md:block" />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="group text-foreground/65 hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded-none px-3 py-2 text-sm font-medium transition-all duration-150"
            >
              <Icon
                className="text-primary size-3.75 shrink-0 transition-transform duration-150 group-hover:scale-110"
                strokeWidth={1.75}
              />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <UserMenu />

          <div className="relative">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">Cart</span>
            </Button>
            {count > 0 && (
              <span className="bg-foreground text-background pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] leading-none font-bold">
                {count}
              </span>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>

            <SheetContent className="flex w-72 flex-col p-0">
              <SheetHeader className="border-border/50 border-b px-4 py-4">
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2.5">
                    <LogoMark className="h-7 w-auto" />
                    <LogoWordmark className="h-3.75 w-auto" />
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
              </SheetHeader>

              <nav className="flex flex-col gap-0.5 p-3">
                {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
                  <SheetClose asChild key={label}>
                    <Link
                      href={href}
                      className="text-foreground/65 hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      <Icon className="text-primary size-5 shrink-0" strokeWidth={1.75} />
                      <span>{label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="border-border/50 mt-auto flex flex-col gap-2 border-t p-4">
                <MobileAuthSection />
                <Button
                  variant="default"
                  className="w-full gap-2"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="size-4" />
                  View Cart{count > 0 ? ` (${count})` : ""}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </motion.header>
  );
}
