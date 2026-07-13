import { Show } from "solid-js";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Task } from "../types";

export function EmptyTasksView(props: { tasks: Task[] }) {
  return (
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
  );
}
