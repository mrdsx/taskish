import { createQuery } from "@tanstack/solid-query";
import { ArrowLeftIcon } from "lucide-solid";
import { Match, Switch } from "solid-js";
import { toast } from "somoto";
import { EmptyErrorView } from "@/components/empty-error-view";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/result";
import { queryKeys } from "../../constants";
import { trashService } from "../../services";
import { setActiveScreen } from "../../stores/active-screen";
import { searchQuery } from "../../stores/search";
import { ExportTasksButton } from "../export-tasks-button";
import { LoadingTasksView } from "../loading-tasks-view";
import { SearchBar } from "../search-bar";
import { FilteredDeletedTasksView } from "./filtered-deleted-tasks-view";

export function TrashScreen() {
  const trashQuery = createQuery(() => ({
    queryKey: queryKeys.trash,
    queryFn: async () => {
      const result = await trashService.getTrash();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to fetch the trash");
      }

      return result.data;
    },
  }));

  return (
    <>
      <SearchBar disabled={trashQuery.isPending} />
      <Switch>
        <Match when={trashQuery.isError}>
          <EmptyErrorView retry={trashQuery.refetch} />
        </Match>
        <Match when={trashQuery.isPending}>
          <LoadingTasksView />
        </Match>
        <Match when={trashQuery.isSuccess}>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setActiveScreen("tasks")}>
              <ArrowLeftIcon /> Go back
            </Button>
            <RefreshButton
              isRefreshing={trashQuery.isRefetching}
              refresh={trashQuery.refetch}
            />
            <ExportTasksButton />
          </div>
          <FilteredDeletedTasksView
            tasks={trashQuery.data}
            searchQuery={searchQuery()}
          />
        </Match>
      </Switch>
    </>
  );
}
