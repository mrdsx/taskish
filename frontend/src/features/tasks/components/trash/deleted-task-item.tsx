import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { ArchiveRestoreIcon } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { queryKeys } from "../../constants";
import { trashService } from "../../services";
import { taskItemStyles } from "../../styles/task-item";
import type { DeletedTask, Task } from "../../types";

export function DeletedTaskItem(props: { task: DeletedTask }) {
  const queryClient = useQueryClient();
  const restoreTaskMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await trashService.restoreById(props.task.id);
      if (!result.success) {
        throw new Error("Failed to restore the task");
      }

      const task: Task = {
        id: props.task.id,
        title: props.task.title,
        subTasks: props.task.subTasks,
      };

      return task;
    },
    onSuccess: (restoredTask) => {
      const tasks = queryClient.getQueryData(queryKeys.tasks) as Task[];
      const newTasks = [...tasks, restoredTask].toSorted(
        (taskA, taskB) => taskA.id - taskB.id,
      );
      queryClient.setQueryData(queryKeys.tasks, newTasks);

      const trash = queryClient.getQueryData(queryKeys.trash) as DeletedTask[];
      const newTrash = trash.filter((task) => task.id !== restoredTask.id);
      queryClient.setQueryData(queryKeys.trash, newTrash);
    },
  }));

  function handleRestoreTask() {
    restoreTaskMutation.mutate();
  }

  return (
    <div class={taskItemStyles.taskItem}>
      <Show when={restoreTaskMutation.isPending}>
        <div class={taskItemStyles.shield} />
      </Show>
      <div class={taskItemStyles.content}>
        <p class={taskItemStyles.title}>{props.task.title}</p>
        <p class={taskItemStyles.expirationLabel}>{props.task.expiresAt}</p>
        <Show when={props.task.subTasks.length > 0}>
          <div class={taskItemStyles.subTasksList}>
            {props.task.subTasks.map((subTask) => (
              <p class={taskItemStyles.subTask}>{subTask}</p>
            ))}
          </div>
        </Show>
      </div>
      <Button size="icon" variant="outline" onClick={handleRestoreTask}>
        <LoadingSwap isLoading={restoreTaskMutation.isPending}>
          <ArchiveRestoreIcon />
        </LoadingSwap>
      </Button>
    </div>
  );
}
