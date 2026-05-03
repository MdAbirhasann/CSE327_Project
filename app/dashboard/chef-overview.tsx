import Link from "next/link";
import { ChefHat, Clock, CheckCircle2, Flame, ArrowRight } from "lucide-react";
import { StatCard } from "./stat-card";

interface ChefOverviewProps {
  user: { name: string; createdAt: Date | string };
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  allTimeCount: number;
}

export function ChefOverview({
  user,
  pendingCount,
  inProgressCount,
  completedTodayCount,
  allTimeCount
}: ChefOverviewProps) {
  const firstName = user.name.split(" ")[0];
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(user.createdAt));

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ready to cook, {firstName}?</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Chef &middot; Member since {memberSince}
        </p>
      </div>

      <section>
        <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
          Today&apos;s Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Waiting in Queue"
            value={pendingCount}
            icon={Clock}
            iconBg="bg-amber-100 dark:bg-amber-950/50"
            iconClass="text-amber-600 dark:text-amber-400"
            sub="need your attention"
          />
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={ChefHat}
            iconBg="bg-orange-100 dark:bg-orange-950/50"
            iconClass="text-orange-600 dark:text-orange-400"
            sub="currently cooking"
          />
          <StatCard
            label="Completed Today"
            value={completedTodayCount}
            icon={CheckCircle2}
            iconBg="bg-green-100 dark:bg-green-950/50"
            iconClass="text-green-600 dark:text-green-400"
          />
          <StatCard
            label="All Time"
            value={allTimeCount}
            icon={Flame}
            iconBg="bg-red-100 dark:bg-red-950/50"
            iconClass="text-red-600 dark:text-red-400"
            sub="orders handled"
          />
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
          Quick Actions
        </h2>
        <Link
          href="/dashboard/kitchen"
          className="bg-card group hover:bg-muted/50 flex items-center gap-4 border px-5 py-4 transition-colors"
        >
          <div className="bg-primary/10 shrink-0 p-3">
            <ChefHat className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Open Kitchen Queue</p>
            <p className="text-muted-foreground text-sm">
              {pendingCount > 0
                ? `${pendingCount} order${pendingCount !== 1 ? "s" : ""} waiting for you`
                : "View and manage incoming orders"}
            </p>
          </div>
          <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </div>
  );
}
