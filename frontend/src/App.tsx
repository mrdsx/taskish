import { Show } from "solid-js";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { isDisplayingTrash, TasksScreen, TrashScreen } from "@/features/tasks";
import { useUserStore } from "@/stores/user";

export function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <>
      <Header />
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
    </>
  );
}
