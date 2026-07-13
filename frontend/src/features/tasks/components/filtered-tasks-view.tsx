import { For, Show } from "solid-js";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Task } from "../types";
import { getFilteredTasks } from "../utils";
import { TaskItem } from "./task-item";

export function FilteredTasksView(props: {
  tasks: Task[];
  searchQuery: string;
}) {
  const filteredTasks = () => getFilteredTasks(props.tasks, props.searchQuery);

  return (
    <>
      <Show when={filteredTasks().length === 0}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No tasks</EmptyTitle>
            <Show when={props.tasks.length === 0}>
              <EmptyDescription>
                Add some tasks in order to see them
              </EmptyDescription>
            </Show>
          </EmptyHeader>
        </Empty>
      </Show>

      <Show when={filteredTasks().length > 0}>
        <ul class="space-y-2 max-h-100 overflow-y-auto">
          <For each={filteredTasks()}>
            {(task) => (
              <li>
                <TaskItem task={task} />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
