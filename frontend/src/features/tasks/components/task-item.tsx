import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { taskService } from "@/features/tasks";
import { DEFAULT_EXPIRATION_TIME, queryKeys } from "../constants";
import { taskItemStyles } from "../styles/task-item";
import type { DeletedTask, Task } from "../types";
import { DeleteTaskAlertDialog } from "./delete-task-alert-dialog";
import { UpdateTaskDialog } from "./update-task-dialog";

export function TaskItem(props: { task: Task }) {
  const queryClient = useQueryClient();
  const deleteTaskMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await taskService.deleteById(props.task.id);
      if (!result.success) {
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      const tasks = queryClient.getQueryData(queryKeys.tasks) as Task[];
      const newTasks = tasks.filter((task) => task.id !== props.task.id);
      queryClient.setQueryData(queryKeys.tasks, newTasks);

      const trash = queryClient.getQueryData(queryKeys.trash) as DeletedTask[];
      const newTrash: DeletedTask[] = [
        ...trash,
        { ...props.task, expiresAt: DEFAULT_EXPIRATION_TIME },
      ].toSorted((taskA, taskB) => taskA.id - taskB.id);
      queryClient.setQueryData(queryKeys.trash, newTrash);
    },
  }));

  function handleDeleteTask() {
    deleteTaskMutation.mutate();
  }

  return (
    <div class={taskItemStyles.taskItem}>
      <Show when={deleteTaskMutation.isPending}>
        <div class={taskItemStyles.shield} />
      </Show>
      <div class={taskItemStyles.content}>
        <p class={taskItemStyles.title}>{props.task.title}</p>
        <Show when={props.task.subTasks.length > 0}>
          <div class={taskItemStyles.subTasksList}>
            {props.task.subTasks.map((subTask) => (
              <p class={taskItemStyles.subTask}>{subTask}</p>
            ))}
          </div>
        </Show>
      </div>
      <div class={taskItemStyles.actions}>
        <UpdateTaskDialog task={props.task} />
        <DeleteTaskAlertDialog
          isDeleting={deleteTaskMutation.isPending}
          deleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
