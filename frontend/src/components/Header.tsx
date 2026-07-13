import { Show } from "solid-js";
import { useUserStore } from "@/stores/user";
import { LogOutButton } from "./LogOutButton";
import { ToggleThemeButton } from "./ToggleThemeButton";

export function Header() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <header class="flex justify-between px-6 py-4">
      <h1 class="font-semibold text-xl">Taskish</h1>
      <div class="flex items-center gap-2">
        <ToggleThemeButton />
        <Show when={isAuthenticated()}>
          <LogOutButton />
        </Show>
      </div>
    </header>
  );
}
