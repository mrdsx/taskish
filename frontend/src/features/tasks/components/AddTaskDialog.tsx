import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { PlusIcon, XIcon } from "lucide-solid";
import { createSignal, Index, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "@/components/ui/text-field";
import { taskService } from "../services";
import type { Task, TaskIn } from "../types";

export function AddTaskDialog() {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [newTask, setNewTask] = createStore<TaskIn>({
    title: "",
    subTasks: [],
  });

  const queryClient = useQueryClient();
  const addTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: TaskIn): Promise<Task> => {
      const result = await taskService.create(taskIn);
      if (!result.success) {
        throw new Error("Failed to create task");
      }

      return result.data;
    },
    onSuccess: (newTask) => {
      const tasks = queryClient.getQueryData(["tasks"]) as Task[];
      const newTasks = [...tasks, newTask];
      queryClient.setQueryData(["tasks"], newTasks);
      setNewTask({ title: "", subTasks: [] });
      setIsOpen(false);
    },
  }));

  function handleAddTask(event: SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    const title = newTask.title.trim();
    const subTasks = newTask.subTasks
      .map((subTask) => subTask.trim())
      .filter((subTask) => subTask.length > 0);
    if (title.length === 0) {
      setFormError("Empty title");
      return;
    }

    const taskIn: TaskIn = {
      title,
      subTasks,
    };
    addTaskMutation.mutate(taskIn);
  }

  return (
    <Dialog open={isOpen()} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger
        as={() => (
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon />
            Add task
          </Button>
        )}
      />
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" onSubmit={handleAddTask}>
          <TextField>
            <TextFieldLabel>Title</TextFieldLabel>
            <TextFieldInput
              placeholder="Enter the title..."
              value={newTask.title}
              disabled={addTaskMutation.isPending}
              onInput={(event) => {
                setNewTask((prevTask) => ({
                  ...prevTask,
                  title: event.currentTarget.value,
                }));
              }}
            />
          </TextField>
          <TextField>
            <TextFieldLabel>Sub tasks</TextFieldLabel>
            <ul class="space-y-2 overflow-auto max-h-60">
              <Index each={newTask.subTasks}>
                {(subTask, index) => (
                  <InputGroup>
                    <InputGroupInput
                      data-value="sub-task"
                      value={subTask()}
                      disabled={addTaskMutation.isPending}
                      onInput={(event) => {
                        setNewTask((prevTask) => ({
                          ...prevTask,
                          subTasks: [
                            ...prevTask.subTasks.slice(0, index),
                            event.currentTarget.value,
                            ...prevTask.subTasks.slice(index + 1),
                          ],
                        }));
                      }}
                    />
                    <InputGroupButton
                      disabled={addTaskMutation.isPending}
                      onClick={() => {
                        setNewTask((prevTask) => ({
                          ...prevTask,
                          subTasks: [...prevTask.subTasks.toSpliced(index, 1)],
                        }));
                      }}
                    >
                      <XIcon />
                    </InputGroupButton>
                  </InputGroup>
                )}
              </Index>
            </ul>
            <Button
              size="icon"
              variant="outline"
              disabled={addTaskMutation.isPending}
              onClick={() => {
                setNewTask((prevTask) => ({
                  ...prevTask,
                  subTasks: [...prevTask.subTasks, ""],
                }));
                const subTaskInputs = document.querySelectorAll(
                  "[data-value='sub-task']",
                );
                const lastInput = subTaskInputs.item(subTaskInputs.length - 1);
                (lastInput as HTMLInputElement).focus();
              }}
            >
              <PlusIcon />
            </Button>
          </TextField>
          <Button type="submit" disabled={addTaskMutation.isPending}>
            <LoadingSwap isLoading={addTaskMutation.isPending}>
              Create task
            </LoadingSwap>
          </Button>
          <Show when={formError() !== null}>
            <p class="mt-2 text-red-500">{formError()}</p>
          </Show>
        </form>
      </DialogContent>
    </Dialog>
  );
}
