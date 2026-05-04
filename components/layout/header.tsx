"use client";

import { useState, useEffect } from "react";
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
  LayoutDashboard,
  UserPlus,
  ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";
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

type DeviceSession = {
  session: { token: string };
  user: { id: string; name: string; email: string; image?: string | null };
};

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
  const [otherSessions, setOtherSessions] = useState<DeviceSession[]>([]);
  const [switchingToken, setSwitchingToken] = useState<string | null>(null);

  async function loadOtherSessions(open: boolean) {
    if (!open || !session) return;
    const { data } = await authClient.multiSession.listDeviceSessions();
    if (data) {
      setOtherSessions(
        (data as DeviceSession[]).filter((s) => s.session.token !== session.session.token)
      );
    }
  }

  async function handleSwitch(token: string) {
    setSwitchingToken(token);
    const { error } = await authClient.multiSession.setActive({ sessionToken: token });
    if (error) {
      toast.error("Failed to switch account");
      setSwitchingToken(null);
    } else {
      window.location.href = "/";
    }
  }

  if (isPending) {
    return <Skeleton className="size-7 rounded-none" />;
  }

  if (session?.user) {
    const initials = getInitials(session.user.name);
    const role = (session.user.role ?? "customer") as AppRole;

    return (
      <DropdownMenu onOpenChange={loadOtherSessions}>
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

        <DropdownMenuContent align="end" className="bg-background w-64 rounded-none p-0">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-3 pt-3 pb-2.5">
              <Avatar className="size-9 shrink-0 rounded-none after:rounded-none">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user.name ?? "User"}
                  className="rounded-none"
                />
                <AvatarFallback className="rounded-none text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{session.user.name}</p>
                <p className="text-muted-foreground truncate text-xs">{session.user.email}</p>
              </div>
            </div>
            <div
              className={cn(
                "border-y px-3 py-1 text-[10px] font-semibold tracking-widest uppercase",
                ROLE_STYLES[role] ?? ROLE_STYLES.customer
              )}
            >
              {ROLE_LABELS[role] ?? role}
            </div>
          </DropdownMenuLabel>

          <div className="p-1">
            <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-none">
              <Link href="/dashboard">
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          </div>

          {otherSessions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-1 pb-1">
                <p className="text-muted-foreground px-2 py-1.5 text-[10px] font-semibold tracking-widest uppercase">
                  Other accounts
                </p>
                {otherSessions.map(({ session: s, user: u }) => {
                  const isSwitching = switchingToken === s.token;
                  return (
                    <DropdownMenuItem
                      key={s.token}
                      onClick={() => handleSwitch(s.token)}
                      disabled={!!switchingToken}
                      className="cursor-pointer gap-3 rounded-none"
                    >
                      <Avatar className="size-6 shrink-0 rounded-none after:rounded-none">
                        <AvatarImage
                          src={u.image ?? undefined}
                          alt={u.name}
                          className="rounded-none"
                        />
                        <AvatarFallback className="rounded-none text-[10px] font-semibold">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{u.name}</p>
                        <p className="text-muted-foreground truncate text-[10px]">{u.email}</p>
                      </div>
                      <ArrowLeftRight
                        className={cn(
                          "text-muted-foreground size-3 shrink-0",
                          isSwitching && "animate-pulse"
                        )}
                      />
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </>
          )}

          <DropdownMenuSeparator />
          <div className="p-1">
            <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-none">
              <Link href="/sign-in">
                <UserPlus className="size-3.5" />
                Add account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer gap-2 rounded-none"
            >
              <LogOut className="size-3.5" />
              Sign out
            </DropdownMenuItem>
          </div>
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
  const [otherSessions, setOtherSessions] = useState<DeviceSession[]>([]);
  const [switchingToken, setSwitchingToken] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    authClient.multiSession.listDeviceSessions().then(({ data }) => {
      if (data) {
        setOtherSessions(
          (data as DeviceSession[]).filter((s) => s.session.token !== session.session.token)
        );
      }
    });
  }, [session]);

  async function handleSwitch(token: string) {
    setSwitchingToken(token);
    const { error } = await authClient.multiSession.setActive({ sessionToken: token });
    if (error) {
      toast.error("Failed to switch account");
      setSwitchingToken(null);
    } else {
      window.location.href = "/";
    }
  }

  if (isPending) {
    return <Skeleton className="h-9 w-full rounded-none" />;
  }

  if (session?.user) {
    const initials = getInitials(session.user.name);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0 rounded-none after:rounded-none">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "User"}
              className="rounded-none"
            />
            <AvatarFallback className="rounded-none text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{session.user.email}</p>
          </div>
          <RoleBadge role={session.user.role ?? "customer"} />
        </div>

        {otherSessions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground px-0.5 text-[10px] font-semibold tracking-widest uppercase">
              Other accounts
            </p>
            {otherSessions.map(({ session: s, user: u }) => {
              const isSwitching = switchingToken === s.token;
              return (
                <button
                  key={s.token}
                  onClick={() => handleSwitch(s.token)}
                  disabled={!!switchingToken}
                  className="hover:bg-accent flex w-full items-center gap-3 px-1 py-2 transition-colors disabled:opacity-50"
                >
                  <Avatar className="size-7 shrink-0 rounded-none after:rounded-none">
                    <AvatarImage src={u.image ?? undefined} alt={u.name} className="rounded-none" />
                    <AvatarFallback className="rounded-none text-xs font-semibold">
                      {getInitials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                  </div>
                  <ArrowLeftRight
                    className={cn(
                      "text-muted-foreground size-3.5 shrink-0",
                      isSwitching && "animate-pulse"
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <SheetClose asChild>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/sign-in">
                <UserPlus className="size-4" />
                Add account
              </Link>
            </Button>
          </SheetClose>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
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
