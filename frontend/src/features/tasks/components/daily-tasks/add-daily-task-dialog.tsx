import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { PlusIcon } from "lucide-solid";
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

export function AddDailyTaskDialog() {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const queryClient = useQueryClient();
  const addTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: DailyTaskIn): Promise<DailyTask> => {
      const result = await dailyTaskService.create(taskIn);
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to create the task");
      }

      return result.data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        queryKeys.dailyTasks,
        (tasks: DailyTask[]): DailyTask[] => {
          return [...tasks, newTask];
        },
      );
      setIsOpen(false);
    },
  }));

  return (
    <Dialog open={isOpen()} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger as={Button}>
        <PlusIcon />
        Add task
      </DialogTrigger>
      <DialogContent class="px-0" showCloseButton>
        <DialogHeader class={`px-${DIALOG_PADDING}`}>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <SubmitDailyTaskForm
          formType="create"
          isDisabled={addTaskMutation.isPending}
          defaultValues={{
            title: "",
            subTasks: [],
            completed: false,
          }}
          onTaskSubmit={(taskIn) => addTaskMutation.mutate(taskIn)}
        />
      </DialogContent>
    </Dialog>
  );
}
