import { useQuery } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import type { Task } from "@/features/tasks";
import { taskService } from "@/features/tasks";
import { searchQuery } from "../stores/search";
import { AddTaskDialog } from "./add-task-dialog";
import { FilteredTasksView } from "./filtered-tasks-view";
import { LoadingTasksView } from "./loading-tasks-view";
import { SearchBar } from "./search-bar";

export function TasksScreen() {
  const tasksQuery = useQuery(() => ({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const result = await taskService.getAll();
      if (!result.success) {
        throw new Error("Failed to fetch tasks");
      }

      return result.data;
    },
  }));

  return (
    <main class="flex justify-center">
      <div class="mx-4 mt-20 w-full max-w-120 space-y-2">
        <SearchBar />
        <Switch>
          <Match when={tasksQuery.isError}>
            <EmptyErrorView retry={tasksQuery.refetch} />
          </Match>
          <Match when={tasksQuery.isPending}>
            <LoadingTasksView />
          </Match>
          <Match when={tasksQuery.isSuccess}>
            <div class="flex flex-wrap gap-2">
              <AddTaskDialog />
              <RefreshButton
                isRefreshing={tasksQuery.isRefetching}
                refresh={tasksQuery.refetch}
              />
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
