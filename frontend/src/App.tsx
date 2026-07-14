import { createEffect, onMount, Show } from "solid-js";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";
import {
  isDisplayingTrash,
  TasksScreen,
  TrashScreen,
  taskService,
} from "@/features/tasks";
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user";

export function App() {
  const user = useUserStore();
  const theme = useThemeStore();

  createEffect(() => {
    if (theme().isDarkMode) {
      document.body.setAttribute("data-kb-theme", "dark");
    } else {
      document.body.removeAttribute("data-kb-theme");
    }
  });

  onMount(async () => {
    const result = await taskService.getAll();
    if (!result.success) {
      user().reset();
    }
  });

  return (
    <>
      <Header />
      <Show when={user().isAuthenticated}>
        <Show when={isDisplayingTrash()}>
          <TrashScreen />
        </Show>
        <Show when={!isDisplayingTrash()}>
          <TasksScreen />
        </Show>
      </Show>
      <Show when={!user().isAuthenticated}>
        <main class="flex justify-center pt-[10vh]">
          <AuthForm />
        </main>
      </Show>
    </>
  );
}
