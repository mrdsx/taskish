import { createQuery } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { toast } from "somoto";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import type { Task } from "@/features/tasks";
import { taskService } from "@/features/tasks";
import { getErrorMessage } from "@/lib/result";
import { useUserStore } from "@/stores/user";
import { queryKeys } from "../constants";
import { searchQuery } from "../stores/search";
import { AddTaskDialog } from "./add-task-dialog";
import { DailyTasksButton } from "./daily-tasks/daily-tasks-button";
import { ExportTasksButton } from "./export-tasks-button";
import { FilteredTasksView } from "./filtered-tasks-view";
import { LoadingTasksView } from "./loading-tasks-view";
import { SearchBar } from "./search-bar";
import { TrashButton } from "./trash/trash-button";

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
  }));

  return (
    <>
      <SearchBar disabled={tasksQuery.isPending} />
      <Switch>
        <Match when={tasksQuery.isError}>
          <EmptyErrorView retry={tasksQuery.refetch} />
        </Match>
        <Match when={tasksQuery.isPending}>
          <LoadingTasksView />
        </Match>
        <Match when={tasksQuery.isSuccess}>
          <div class="flex flex-col gap-2">
            <AddTaskDialog />
            <div class="flex flex-wrap gap-2">
              <RefreshButton
                isRefreshing={tasksQuery.isRefetching}
                refresh={tasksQuery.refetch}
              />
              <ExportTasksButton />
              <DailyTasksButton />
              <TrashButton />
            </div>
          </div>
          <FilteredTasksView
            tasks={tasksQuery.data}
            searchQuery={searchQuery()}
          />
        </Match>
      </Switch>
    </>
  );
}
