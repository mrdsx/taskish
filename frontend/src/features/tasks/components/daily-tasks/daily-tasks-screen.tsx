import { createQuery } from "@tanstack/solid-query";
import { ArrowLeftIcon } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { toast } from "somoto";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/result";
import { queryKeys } from "../../constants";
import { dailyTaskService } from "../../services";
import { setActiveScreen } from "../../stores/active-screen";
import { searchQuery } from "../../stores/search";
import type { DailyTask } from "../../types";
import { ExportTasksButton } from "../export-tasks-button";
import { LoadingTasksView } from "../loading-tasks-view";
import { SearchBar } from "../search-bar";
import { AddDailyTaskDialog } from "./add-daily-task-dialog";
import { FilteredDailyTasksView } from "./filtered-daily-tasks-view";

export function DailyTasksScreen() {
  const dailyTasksQuery = createQuery(() => ({
    queryKey: queryKeys.dailyTasks,
    queryFn: async (): Promise<DailyTask[]> => {
      const result = await dailyTaskService.getAll();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch tasks");
      }

      return result.data;
    },
  }));

  return (
    <>
      <SearchBar disabled={dailyTasksQuery.isPending} />
      <Switch>
        <Match when={dailyTasksQuery.isError}>
          <EmptyErrorView retry={dailyTasksQuery.refetch} />
        </Match>
        <Match when={dailyTasksQuery.isPending}>
          <LoadingTasksView />
        </Match>
        <Match when={dailyTasksQuery.isSuccess}>
          <div class="flex flex-col gap-2">
            <AddDailyTaskDialog />
            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveScreen("tasks")}
              >
                <ArrowLeftIcon />
                Go back
              </Button>
              <RefreshButton
                isRefreshing={dailyTasksQuery.isRefetching}
                refresh={dailyTasksQuery.refetch}
              />
              <ExportTasksButton />
            </div>
          </div>
          <FilteredDailyTasksView
            tasks={dailyTasksQuery.data}
            searchQuery={searchQuery()}
          />
        </Match>
      </Switch>
    </>
  );
}
