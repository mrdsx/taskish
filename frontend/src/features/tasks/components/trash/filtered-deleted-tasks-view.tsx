import { For, Show } from "solid-js";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { DeletedTask } from "../../types";
import { getFilteredTasks } from "../../utils";
import { DeletedTaskItem } from "./deleted-task-item";

export function FilteredDeletedTasksView(props: {
  tasks: DeletedTask[];
  searchQuery: string;
}) {
  const filteredTasks = () => getFilteredTasks(props.tasks, props.searchQuery);

  return (
    <>
      <Show when={filteredTasks().length === 0}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Trash is empty</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </Show>

      <Show when={filteredTasks().length > 0}>
        <ul class="max-h-100 space-y-2 overflow-y-auto">
          <For each={filteredTasks()}>
            {(task) => (
              <li>
                <DeletedTaskItem task={task} />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
