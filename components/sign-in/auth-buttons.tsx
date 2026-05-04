"use client";

import Link from "next/link";
import { Fingerprint, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <clipPath id="google-clip">
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
      </clipPath>
      <g clipPath="url(#google-clip)">
        <path fill="#FBBC05" d="M0 37V11l17 13z" />
        <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
        <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
        <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
      </g>
    </svg>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="lg:bg-border h-px flex-1 bg-white/15" />
      <span className="lg:text-muted-foreground/60 text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
        {label}
      </span>
      <div className="lg:bg-border h-px flex-1 bg-white/15" />
    </div>
  );
}

const PASSKEY_ERRORS: Record<string, string> = {
  AUTH_CANCELLED: "Sign-in was cancelled.",
  PASSKEY_NOT_FOUND: "No passkey found for this device. Try signing in with Google instead.",
  AUTHENTICATION_FAILED: "Couldn't verify your passkey. Please try again.",
  CHALLENGE_NOT_FOUND: "Session expired — please refresh and try again.",
  UNABLE_TO_CREATE_SESSION: "Signed in but couldn't start your session. Please try again.",
  PREVIOUSLY_REGISTERED: "This passkey is already linked to your account.",
  REGISTRATION_CANCELLED: "Passkey setup was cancelled.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  SESSION_REQUIRED: "You must be signed in to add a passkey.",
  BAD_REQUEST: "Invalid request. Please try again.",
  UNAUTHORIZED: "Account not found. Sign in with Google first.",
  INTERNAL_SERVER_ERROR: "Server error — please try again in a moment.",
  FAILED_TO_VERIFY_REGISTRATION: "Passkey registration failed. Please try again."
};

function getPasskeyError(code?: string | null): string {
  return (code && PASSKEY_ERRORS[code]) ?? "Passkey sign-in failed. Please try again.";
}

export function AuthButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const { data: session } = authClient.useSession();
  const isAddingAccount = !!session?.user;

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  async function handleGoogle() {
    setIsGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl
    });
    setIsGoogleLoading(false);
  }

  async function handlePasskey() {
    setIsPasskeyLoading(true);
    const result = await authClient.signIn.passkey();
    if (result?.error) {
      const code = "code" in result.error ? result.error.code : undefined;
      const message = getPasskeyError(code);
      if (code === "AUTH_CANCELLED") {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    } else {
      router.replace(callbackUrl);
    }
    setIsPasskeyLoading(false);
  }

  return (
    <div className="space-y-5">
      {isAddingAccount ? (
        <div className="flex items-start gap-3">
          <UserPlus
            className="mt-0.5 size-5 shrink-0 text-white lg:text-zinc-500"
            strokeWidth={1.75}
          />
          <div className="space-y-0.5">
            <p className="lg:text-foreground text-sm font-semibold text-white">
              Add another account
            </p>
            <p className="lg:text-muted-foreground text-xs text-white/60">
              Signed in as <span className="font-medium">{session.user.name}</span>. Sign in below
              to add a second account.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <h1 className="lg:text-foreground text-2xl font-semibold tracking-tight text-white">
            Sign in
          </h1>
          <p className="lg:text-muted-foreground text-sm text-white/60">
            Access your orders, track deliveries, and explore our menu.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isGoogleLoading || isPasskeyLoading}
        className="lg:border-border flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-none border border-white/25 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 lg:shadow-sm"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <Divider label="or" />

      <button
        type="button"
        onClick={handlePasskey}
        disabled={isGoogleLoading || isPasskeyLoading}
        className="lg:border-border lg:bg-background lg:text-foreground lg:hover:bg-accent flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-none border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Fingerprint className="text-primary size-4" strokeWidth={1.75} />
        {isPasskeyLoading ? "Authenticating…" : "Sign in with Passkey"}
      </button>

      <Divider label="disclaimer" />

      <p className="lg:text-muted-foreground/70 text-center text-[11px] leading-relaxed text-white/50">
        By continuing you agree to our{" "}
        <Link
          href="/terms"
          className="lg:hover:text-foreground underline underline-offset-2 transition-colors hover:text-white"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="lg:hover:text-foreground underline underline-offset-2 transition-colors hover:text-white"
        >
          Privacy Policy
        </Link>
        . Crunch Time does not store or process payment details directly.
      </p>
    </div>
  );
}
