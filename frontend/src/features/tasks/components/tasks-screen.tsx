import { createQuery } from "@tanstack/solid-query";
import { TrashIcon } from "lucide-solid";
import { Match, Switch } from "solid-js";
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
import { ExportTasksButton } from "./export-tasks-button";
import { FilteredTasksView } from "./filtered-tasks-view";
import { LoadingTasksView } from "./loading-tasks-view";
import { SearchBar } from "./search-bar";

export function TasksScreen() {
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const tasksQuery = createQuery(() => ({
    queryKey: queryKeys.tasks,
    queryFn: async (): Promise<Task[]> => {
      const result = await taskService.getAll();
      if (!result.success) {
        if (result.errorCode === "auth_error") {
          setIsAuthenticated(false);
        }
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch tasks");
      }

      return result.data;
    },
    networkMode: "offlineFirst",
    gcTime: 1000 * 60 * 60 * 24,
  }));

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
            <div class="flex flex-wrap justify-between gap-2">
              <div class="flex flex-wrap gap-2">
                <AddTaskDialog />
                <RefreshButton
                  isRefreshing={tasksQuery.isRefetching}
                  refresh={tasksQuery.refetch}
                />
                <ExportTasksButton />
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
