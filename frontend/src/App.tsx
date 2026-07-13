import { createEffect, Match, onMount, Switch } from "solid-js";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";
import { TasksScreen, taskService } from "@/features/tasks";
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
      <Switch>
        <Match when={user().isAuthenticated}>
          <TasksScreen />
        </Match>
        <Match when={!user().isAuthenticated}>
          <main class="flex justify-center pt-[10vh]">
            <AuthForm />
          </main>
        </Match>
      </Switch>
    </>
  );
}
