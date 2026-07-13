import { useQuery } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { EmptyErrorView } from "@/components/EmptyErrorView";
import { RefreshButtonView } from "@/components/RefreshButtonView";
import type { Task } from "@/features/tasks";
import { taskService } from "@/features/tasks";
import { searchQuery } from "../stores/search";
import { AddTaskDialog } from "./AddTaskDialog/AddTaskDialog";
import { FilteredTasksView } from "./FilteredTasksView";
import { LoadingTasksView } from "./LoadingTasksView";
import { SearchBar } from "./SearchBar";

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
              <RefreshButtonView
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
