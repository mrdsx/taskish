import { Show } from "solid-js";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { AuthForm } from "@/features/auth";
import { isDisplayingTrash, TasksScreen, TrashScreen } from "@/features/tasks";
import { useUserStore } from "@/stores/user";

export function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <div class="flex h-screen flex-col">
      <Header />
      <main class="mx-auto flex min-h-0 w-full max-w-150 flex-col gap-2 pt-20 pb-4">
        <Show when={isAuthenticated()}>
          <Show when={isDisplayingTrash()}>
            <TrashScreen />
          </Show>
          <Show when={!isDisplayingTrash()}>
            <TasksScreen />
          </Show>
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
