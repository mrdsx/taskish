import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { SquarePenIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { toast } from "somoto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/result";
import { DIALOG_PADDING, queryKeys } from "../../constants";
import { dailyTaskService } from "../../services";
import type { DailyTask, DailyTaskIn } from "../../types";
import { SubmitDailyTaskForm } from "../submit-task-form/submit-daily-task-form";

export function UpdateDailyTaskDialog(props: { task: DailyTask }) {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const queryClient = useQueryClient();
  const updateTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: DailyTaskIn): Promise<DailyTask> => {
      const result = await dailyTaskService.updateById(props.task.id, taskIn);
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to update the task");
      }

      return result.data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        queryKeys.dailyTasks,
        (tasks: DailyTask[]): DailyTask[] => {
          return tasks.map((task) => {
            if (task.id === newTask.id) {
              return newTask;
            }
            return task;
          });
        },
      );
      setIsOpen(false);
    },
  }));

  return (
    <Dialog open={isOpen()} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger as={Button} size="icon" variant="outline">
        <SquarePenIcon />
      </DialogTrigger>
      <DialogContent class="px-0" showCloseButton>
        <DialogHeader class={`px-${DIALOG_PADDING}`}>
          <DialogTitle>Update task</DialogTitle>
        </DialogHeader>
        <SubmitDailyTaskForm
          formType="update"
          isDisabled={updateTaskMutation.isPending}
          defaultValues={{
            title: props.task.title,
            subTasks: props.task.subTasks,
            completed: props.task.completed,
          }}
          onTaskSubmit={(taskIn) => updateTaskMutation.mutate(taskIn)}
        />
      </DialogContent>
    </Dialog>
  );
}
