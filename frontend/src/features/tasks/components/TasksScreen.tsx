import {
  createMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { LoaderCircleIcon, PlusIcon, XIcon } from "lucide-solid";
import { createSignal, For, Index, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { EmptyErrorView } from "@/components/EmptyErrorView";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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
import type { Task, TaskIn } from "@/features/tasks";
import { getFilteredTasks, taskService } from "@/features/tasks";
import { searchQuery } from "../stores/search";
import { SearchBar } from "./SearchBar";
import { TaskItem } from "./TaskItem";

export function TasksScreen() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = createSignal<string>("");
  const [newTask, setNewTask] = createStore<TaskIn>({
    title: "",
    subTasks: [],
  });
  const tasksQuery = useQuery(() => ({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const result = await taskService.getAll();
      if (!result.success) {
        throw new Error("Failed to fetch tasks");
      }

      return result.data;
    },
    retry: false,
  }));

  const [isOpen, setIsOpen] = createSignal<boolean>(false);
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
  const filteredTasks = () => getFilteredTasks(tasksQuery.data, searchQuery());

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
    <main class="flex justify-center">
      <div class="mx-4 mt-20 w-full max-w-120 space-y-2">
        <SearchBar />
        <Switch>
          <Match when={tasksQuery.isError}>
            <EmptyErrorView retry={tasksQuery.refetch} />
          </Match>
          <Match when={tasksQuery.isPending}>
            <div class="flex justify-center items-center gap-2 py-5">
              <LoaderCircleIcon class="animate-spin size-5" />
              <p>Loading tasks...</p>
            </div>
          </Match>
          <Match when={tasksQuery.isSuccess}>
            <Dialog
              open={isOpen()}
              onOpenChange={(isOpen) => setIsOpen(isOpen)}
            >
              <DialogTrigger
                as={() => (
                  <Button onClick={() => setIsOpen(true)}>Create task</Button>
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
                                  subTasks: [
                                    ...prevTask.subTasks.toSpliced(index, 1),
                                  ],
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
                        const lastInput = subTaskInputs.item(
                          subTaskInputs.length - 1,
                        );
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
            <ul class="space-y-2 max-h-100 overflow-y-auto">
              <Show when={filteredTasks().length === 0}>
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No tasks</EmptyTitle>
                    <Show when={tasksQuery.data?.length === 0}>
                      <EmptyDescription>
                        Add some tasks in order to see them
                      </EmptyDescription>
                    </Show>
                  </EmptyHeader>
                </Empty>
              </Show>
              <For each={filteredTasks()}>
                {(task) => (
                  <li>
                    <TaskItem task={task} />
                  </li>
                )}
              </For>
            </ul>
          </Match>
        </Switch>
      </div>
    </main>
  );
}
