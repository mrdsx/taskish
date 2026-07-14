import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { SquarePenIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DIALOG_PADDING, queryKeys } from "../constants";
import { taskService } from "../services";
import type { Task, TaskIn } from "../types";
import { SubmitTaskForm } from "./submit-task-form/submit-task-form";

export function UpdateTaskDialog(props: { task: Task }) {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  const queryClient = useQueryClient();
  const updateTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: TaskIn): Promise<Task> => {
      const result = await taskService.updateById(props.task.id, taskIn);
      if (!result.success) {
        throw new Error("Failed to update the task");
      }

      return result.data;
    },
    onSuccess: (newTask) => {
      const tasks = queryClient.getQueryData(queryKeys.tasks) as Task[];
      const newTasks = tasks.map((task) => {
        if (task.id === newTask.id) {
          return newTask;
        }
        return task;
      });
      queryClient.setQueryData(queryKeys.tasks, newTasks);
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
        <SubmitTaskForm
          isPending={updateTaskMutation.isPending}
          defaultValues={{
            title: props.task.title,
            subTasks: props.task.subTasks,
          }}
          setTask={(taskIn) => updateTaskMutation.mutate(taskIn)}
        />
      </DialogContent>
    </Dialog>
  );
}
