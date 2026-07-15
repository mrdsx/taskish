import { createQuery } from "@tanstack/solid-query";
import { TrashIcon } from "lucide-solid";
import { createEffect, Match, Switch } from "solid-js";
import { toast } from "somoto";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import type { Task } from "@/features/tasks";
import { taskService } from "@/features/tasks";
import { getErrorMessage } from "@/lib/result";
import { useUserStore } from "@/stores/user";
import { queryKeys } from "../constants";
import { setIsDisplayingTrash } from "../stores/display-mode";
import { searchQuery } from "../stores/search";
import { AddTaskDialog } from "./add-task-dialog";
import { FilteredTasksView } from "./filtered-tasks-view";
import { LoadingTasksView } from "./loading-tasks-view";
import { SearchBar } from "./search-bar";

export function TasksScreen() {
  const resetUserStore = useUserStore((state) => state.reset);
  const tasksQuery = createQuery(() => ({
    queryKey: queryKeys.tasks,
    queryFn: async (): Promise<Task[]> => {
      const result = await taskService.getAll();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch tasks");
      }

      return result.data;
    },
    networkMode: "offlineFirst",
    gcTime: 1000 * 60 * 60 * 24,
  }));

  createEffect(() => {
    if (tasksQuery.isError) {
      resetUserStore();
    }
  });

  return (
    <main class="flex justify-center">
      <div class="mx-4 mt-20 w-full max-w-120 space-y-2">
        <SearchBar disabled={tasksQuery.isPending} />
        <Switch>
          <Match when={tasksQuery.isError}>
            <EmptyErrorView retry={tasksQuery.refetch} />
          </Match>
          <Match when={tasksQuery.isPending}>
            <LoadingTasksView />
          </Match>
          <Match when={tasksQuery.isSuccess}>
            <div class="flex flex-wrap gap-2 justify-between">
              <div class="flex flex-wrap gap-2">
                <AddTaskDialog />
                <RefreshButton
                  isRefreshing={tasksQuery.isRefetching}
                  refresh={tasksQuery.refetch}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsDisplayingTrash(true)}
              >
                <TrashIcon />
                Trash
              </Button>
            </div>
            <FilteredTasksView
              tasks={tasksQuery.data}
              searchQuery={searchQuery()}
            />
          </Match>
        </Switch>
      </div>
    </main>
  );
}
