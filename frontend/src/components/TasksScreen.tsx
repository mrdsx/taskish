import {
  createMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { LoaderCircleIcon, PlusIcon, XIcon } from "lucide-solid";
import { createSignal, For, Index, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import type { Task, TaskIn } from "@/lib/types";
import { useUserStore } from "@/stores/user";
import { TaskItem } from "./TaskItem";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./ui/empty";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { LoadingSwap } from "./ui/loading-swap";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export function TasksScreen() {
  const user = useUserStore();
  const queryClient = useQueryClient();
  const reset = useUserStore((state) => state.reset);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [newTask, setNewTask] = createStore<TaskIn>({
    title: "",
    subTasks: [],
  });
  const tasksQuery = useQuery(() => ({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      // TODO: extract to repository
      const response = await fetch(`${user().apiUrl}/api/tasks`, {
        headers: { "auth-token": user().authToken },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      return await response.json();
    },
    retry: false,
  }));

  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const addTaskMutation = createMutation(() => ({
    mutationFn: async (taskIn: TaskIn): Promise<Task> => {
      // TODO: extract to repository
      const response = await fetch(`${user().apiUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "auth-token": user().authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskIn),
      });

      return response.json();
    },
    onSuccess: (newTask) => {
      const tasks = queryClient.getQueryData(["tasks"]) as Task[];
      const newTasks = [...tasks, newTask];
      queryClient.setQueryData(["tasks"], newTasks);
      setNewTask({ title: "", subTasks: [] });
      setIsOpen(false);
    },
  }));
  const [searchQuery, setSearchQuery] = createSignal<string | null>(null);
  const filteredTasks = () =>
    tasksQuery.data === undefined || !Array.isArray(tasksQuery.data)
      ? []
      : tasksQuery.data.filter((task) =>
          searchQuery() === null
            ? true
            : task.title
                .toLowerCase()
                .trim()
                .includes(searchQuery().toLowerCase().trim()) ||
              task.subTasks.some((subTask) =>
                subTask
                  .toLowerCase()
                  .trim()
                  .includes(searchQuery().toLowerCase().trim()),
              ),
        );

  function handleLogOut() {
    reset();
  }

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
    <>
      <header class="flex justify-between px-6 py-4">
        <h1 class="font-semibold text-xl">Taskish</h1>
        <Button variant="outline" onClick={handleLogOut}>
          Log Out
        </Button>
      </header>
      <main class="flex justify-center">
        <div class="mx-4 mt-20 w-full max-w-120 space-y-2">
          <InputGroup>
            <InputGroupInput
              placeholder="Type your search query..."
              value={searchQuery()}
              onInput={(event) => {
                setSearchQuery(event.currentTarget.value);
              }}
            />
            <Show when={searchQuery()?.length > 0}>
              <InputGroupButton>
                <XIcon />
              </InputGroupButton>
            </Show>
          </InputGroup>
          <Switch>
            <Match when={tasksQuery.isError}>
              <Empty variant="destructive">
                <EmptyHeader>
                  <EmptyTitle>Something went wrong!</EmptyTitle>
                  <EmptyDescription>
                    Something isn't working as expected.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="destructive" onClick={tasksQuery.refetch}>
                    Try again
                  </Button>
                </EmptyContent>
              </Empty>
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
                <DialogTrigger>
                  <Button>Create task</Button>
                </DialogTrigger>
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
    </>
  );
}
