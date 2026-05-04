import type { Metadata } from "next";
import { requireAuth } from "@/lib/dal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UpdateProfileForm } from "./update-profile-form";
import { ManagePasskeys } from "./manage-passkeys";
import { ManageSessions } from "./manage-sessions";

export const metadata: Metadata = {
  title: "Profile | Crunch Time"
};

export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="text-sm font-medium">Profile</span>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your account details and security.</p>
        </div>
        <div className="flex max-w-2xl flex-col gap-6">
          <UpdateProfileForm
            user={{
              name: session.user.name ?? "",
              email: session.user.email,
              image: session.user.image
            }}
          />
          <div id="passkeys">
            <ManagePasskeys />
          </div>
          <div id="sessions">
            <ManageSessions currentToken={session.session.token} />
          </div>
        </div>
      </div>
    </>
  );
}
