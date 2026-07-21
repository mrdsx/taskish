import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { toast } from "somoto";
import { getErrorMessage } from "@/lib/result";
import { cx } from "@/lib/utils";
import { queryKeys } from "../../constants";
import { dailyTaskService } from "../../services";
import { taskItemStyles } from "../../styles/task-item";
import type { DailyTask } from "../../types";
import { DeleteTaskAlertDialog } from "../delete-task-alert-dialog";
import { UpdateDailyTaskDialog } from "./update-daily-task-dialog";

export function DailyTaskItem(props: { task: DailyTask }) {
  const queryClient = useQueryClient();
  const deleteTaskMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await dailyTaskService.deleteById(props.task.id);
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.dailyTasks,
        (tasks: DailyTask[]): DailyTask[] => {
          return tasks.filter((task) => task.id !== props.task.id);
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
        <p
          class={cx(
            taskItemStyles.title,
            props.task.completed && "text-muted-foreground line-through",
          )}
        >
          {props.task.title}
        </p>
        <Show when={props.task.subTasks.length > 0}>
          <div class={taskItemStyles.subTasksList}>
            {props.task.subTasks.map((subTask) => (
              <p
                class={cx(
                  taskItemStyles.subTask,
                  props.task.completed && "opacity-60 line-through",
                )}
              >
                {subTask}
              </p>
            ))}
          </div>
        </Show>
      </div>
      <div class={taskItemStyles.actions}>
        <UpdateDailyTaskDialog task={props.task} />
        <DeleteTaskAlertDialog
          description="This task will be permanently deleted."
          isDeleting={deleteTaskMutation.isPending}
          deleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
