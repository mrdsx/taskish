import { Show } from "solid-js";
import { LogOutButton } from "@/features/auth";
import { RecentRequestAttemptsDialog } from "@/features/request-attempts";
import { useUserStore } from "@/stores/user";
import { ToggleThemeButton } from "./toggle-theme-button";

export function Header() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <header class="flex justify-between px-6 py-4">
      <h1 class="font-semibold text-xl">Taskish</h1>
      <div class="flex items-center gap-2">
        <Show when={isAuthenticated()}>
          <RecentRequestAttemptsDialog />
        </Show>
        <ToggleThemeButton />
        <Show when={isAuthenticated()}>
          <LogOutButton />
        </Show>
      </div>
    </header>
  );
}
