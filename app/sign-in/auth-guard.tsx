"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Only auto-redirect when coming from a protected page (callbackUrl set).
    // Without callbackUrl the user is here to add another account — let them sign in.
    if (!isPending && session?.user && callbackUrl) {
      router.replace(callbackUrl);
    }
  }, [session, isPending, callbackUrl, router]);

  if (isPending || (session?.user && callbackUrl)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <>{children}</>;
}
