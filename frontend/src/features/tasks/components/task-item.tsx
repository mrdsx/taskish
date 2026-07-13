import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { Trash2Icon } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { taskService } from "@/features/tasks";
import type { Task } from "../types";
import { UpdateTaskDialog } from "./update-task-dialog";

export function TaskItem(props: { task: Task }) {
  const queryClient = useQueryClient();
  const deleteTaskMutation = useMutation(() => ({
    mutationKey: ["deleteTask", props.task.id],
    mutationFn: async () => {
      const result = await taskService.deleteById(props.task.id);
      if (!result.success) {
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      const tasks = queryClient.getQueryData(["tasks"]) as Task[];
      const newTasks = tasks.filter((task) => task.id !== props.task.id);
      queryClient.setQueryData(["tasks"], newTasks);
    },
  }));

  function handleDeleteTask() {
    deleteTaskMutation.mutate();
  }

  return (
    <div class="relative flex justify-between gap-2 overflow-hidden rounded-lg border bg-neutral-50 p-2 dark:bg-neutral-900">
      <Show when={deleteTaskMutation.isPending}>
        <div class="absolute inset-0 bg-muted opacity-50" />
      </Show>
      <div class="w-auto space-y-2">
        <p class="wrap-anywhere line-clamp-2 font-semibold text-[17px]">
          {props.task.title}
        </p>
        <div class="flex flex-wrap gap-1">
          {props.task.subTasks.map((subTask) => (
            <p class="wrap-anywhere flex w-fit items-center rounded-md bg-blue-200 px-2 dark:bg-blue-900">
              {subTask}
            </p>
          ))}
        </div>
      </div>
      <div class="flex gap-2">
        <UpdateTaskDialog task={props.task} />
        <Button size="icon" variant="destructive" onClick={handleDeleteTask}>
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
