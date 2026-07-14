import { onMount, Show } from "solid-js";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import {
  isDisplayingTrash,
  TasksScreen,
  TrashScreen,
  taskService,
} from "@/features/tasks";
import { useUserStore } from "@/stores/user";

export function App() {
  const userStore = useUserStore();

  onMount(async () => {
    if (!userStore().isAuthenticated) {
      userStore().reset();
      return;
    }

    const result = await taskService.getAll();
    if (result.errorCode === "auth_error") {
      userStore().reset();
    }
  });

  return (
    <>
      <Header />
      <Show when={userStore().isAuthenticated}>
        <Show when={isDisplayingTrash()}>
          <TrashScreen />
        </Show>
        <Show when={!isDisplayingTrash()}>
          <TasksScreen />
        </Show>
      </Show>
      <Show when={!userStore().isAuthenticated}>
        <main class="flex justify-center pt-[10vh]">
          <AuthForm />
        </main>
      </Show>
      <Toaster richColors />
    </>
  );
}
