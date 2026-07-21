import { Match, Show, Switch } from "solid-js";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { AuthForm } from "@/features/auth";
import { activeScreen, TasksScreen, TrashScreen } from "@/features/tasks";
import { useUserStore } from "@/stores/user";
import { DailyTasksScreen } from "./features/tasks/components/daily-tasks/daily-tasks-screen";

export function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <div class="flex h-screen flex-col">
      <Header />
      <main class="mx-auto flex min-h-0 w-full max-w-150 flex-col gap-2 px-4 pt-20 pb-8">
        <Show when={isAuthenticated()}>
          <Switch>
            <Match when={activeScreen() === "tasks"}>
              <TasksScreen />
            </Match>
            <Match when={activeScreen() === "trash"}>
              <TrashScreen />
            </Match>
            <Match when={activeScreen() === "dailyTasks"}>
              <DailyTasksScreen />
            </Match>
          </Switch>
        </Show>
        <Show when={!isAuthenticated()}>
          <main class="flex justify-center pt-[10vh]">
            <AuthForm />
          </main>
        </Show>
        <Toaster richColors />
      </main>
    </div>
  );
}
