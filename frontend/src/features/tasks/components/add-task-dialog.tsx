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
import { DIALOG_PADDING, queryKeys } from "../constants";
import { taskService } from "../services";
import type { Task, TaskIn } from "../types";
import { SubmitTaskForm } from "./submit-task-form/submit-task-form";

export function AddTaskDialog() {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const queryClient = useQueryClient();
  const addTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: TaskIn): Promise<Task> => {
      const result = await taskService.create(taskIn);
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to create the task");
      }

      return result.data;
    },
    onSuccess: (newTask) => {
      const tasks = queryClient.getQueryData(queryKeys.tasks) as Task[];
      const newTasks = [...tasks, newTask];
      queryClient.setQueryData(queryKeys.tasks, newTasks);
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
        <SubmitTaskForm
          isPending={addTaskMutation.isPending}
          defaultValues={{
            title: "",
            subTasks: [],
          }}
          setTask={(taskIn) => addTaskMutation.mutate(taskIn)}
        />
      </DialogContent>
    </Dialog>
  );
}
