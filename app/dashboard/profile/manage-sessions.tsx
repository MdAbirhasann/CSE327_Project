"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MonitorSmartphone, Trash2, RefreshCw, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DeviceSession = {
  session: { token: string; userAgent?: string | null; createdAt: Date };
  user: { id: string; name: string; email: string; image?: string | null };
};

export function ManageSessions({ currentToken }: { currentToken: string }) {
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [switchingToken, setSwitchingToken] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await authClient.multiSession.listDeviceSessions();
    setLoading(false);
    if (error) {
      toast.error("Failed to load sessions");
    } else {
      setSessions((data as DeviceSession[]) ?? []);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleSwitch(token: string) {
    setSwitchingToken(token);
    const { error } = await authClient.multiSession.setActive({ sessionToken: token });
    setSwitchingToken(null);
    if (error) {
      toast.error(error.message ?? "Failed to switch session");
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function handleRevoke(token: string) {
    setRevokingToken(token);
    const { error } = await authClient.multiSession.revoke({ sessionToken: token });
    setRevokingToken(null);
    if (error) {
      toast.error(error.message ?? "Failed to revoke session");
    } else {
      if (token === currentToken) {
        window.location.href = "/sign-in";
      } else {
        setSessions((prev) => prev?.filter((s) => s.session.token !== token) ?? null);
      }
    }
  }

  return (
    <div className="border">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Active Sessions</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            All accounts signed in on this device.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-7 rounded-none"
          onClick={fetchSessions}
          disabled={loading}
          aria-label="refresh sessions"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="divide-y">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="size-4 shrink-0 rounded-none" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-36 rounded-none" />
                  <Skeleton className="h-2.5 w-48 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2.5 px-5 py-6 text-xs">
            <MonitorSmartphone className="size-3.5 shrink-0" strokeWidth={1.75} />
            No sessions found.
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map(({ session, user }) => {
              const isActive = session.token === currentToken;
              const isSwitching = switchingToken === session.token;
              const isRevoking = revokingToken === session.token;

              return (
                <div
                  key={session.token}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 transition-opacity",
                    isRevoking && "pointer-events-none opacity-40"
                  )}
                >
                  <MonitorSmartphone
                    className="text-muted-foreground mt-0.5 size-4 shrink-0 self-start"
                    strokeWidth={1.75}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-tight font-medium">{user.name}</span>
                      {isActive && (
                        <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-none px-2.5 text-xs"
                        onClick={() => handleSwitch(session.token)}
                        disabled={isSwitching || isRevoking}
                      >
                        {isSwitching ? "Switching…" : "Switch"}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive size-7 rounded-none"
                      onClick={() => handleRevoke(session.token)}
                      disabled={isSwitching || isRevoking}
                      aria-label="revoke session"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t px-5 py-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-none"
          onClick={() => {
            window.location.href = "/sign-in";
          }}
        >
          <Plus className="size-3.5" />
          Add account
        </Button>
      </div>
    </div>
  );
}
