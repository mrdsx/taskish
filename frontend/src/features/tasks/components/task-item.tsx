import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { toast } from "somoto";
import { taskService } from "@/features/tasks";
import { getErrorMessage } from "@/lib/result";
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
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.tasks, (tasks: Task[]): Task[] => {
        return tasks.filter((task) => task.id !== props.task.id);
      });

      queryClient.setQueryData(
        queryKeys.trash,
        (trash: DeletedTask[]): DeletedTask[] => {
          const newDeletedTask: DeletedTask = {
            ...props.task,
            expiresAt: DEFAULT_EXPIRATION_TIME,
          };
          return [...trash, newDeletedTask].toSorted(
            (taskA, taskB) => taskA.id - taskB.id,
          );
        },
      );
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
          description={`The task will be moved to the trash. You can
                        restore it within 7 days until it's permanently deleted.`}
          isDeleting={deleteTaskMutation.isPending}
          deleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
