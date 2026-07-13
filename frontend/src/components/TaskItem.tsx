import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { Trash2Icon } from "lucide-solid";
import { Show } from "solid-js";
import type { Task } from "@/lib/types";
import { useUserStore } from "@/stores/user";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";

export function TaskItem(props: { task: Task }) {
  const user = useUserStore();
  const queryClient = useQueryClient();
  const deleteTaskMutation = useMutation(() => ({
    mutationKey: ["deleteTask", props.task.id],
    mutationFn: async () => {
      // TODO: extract to repository
      await fetch(`${user().apiUrl}/api/tasks/${props.task.id}`, {
        method: "DELETE",
        headers: { "auth-token": user().authToken },
      });
    },
    onSuccess: () => {
      const tasks = queryClient.getQueryData(["tasks"]) as Task[];
      const newTasks = tasks.filter((task) => task.id !== props.task.id);
      queryClient.setQueryData(["tasks"], newTasks);
    },
  }));

  function handleClick() {
    deleteTaskMutation.mutate();
  }

  return (
    <div class="flex justify-between relative gap-2 overflow-hidden rounded-lg border bg-gray-50 p-2">
      <div class="w-auto max-w-100">
        <Show when={deleteTaskMutation.isPending}>
          <div class="bg-muted absolute inset-0 opacity-50" />
        </Show>
        <p class="wrap-anywhere line-clamp-2 font-semibold text-[17px]">
          {props.task.title}
        </p>
        <ul class="space-y-1">
          {props.task.subTasks.map((subTask) => (
            <p class="wrap-anywhere w-fit rounded-md bg-blue-200 px-2">
              {subTask}
            </p>
          ))}
        </ul>
      </div>
      <Button
        size="icon"
        variant="destructive"
        disabled={deleteTaskMutation.isPending}
        onClick={handleClick}
      >
        <LoadingSwap isLoading={deleteTaskMutation.isPending}>
          <Trash2Icon />
        </LoadingSwap>
      </Button>
    </div>
  );
}
