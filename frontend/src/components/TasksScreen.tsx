import { useQuery } from "@tanstack/solid-query";
import { PlusIcon, XIcon } from "lucide-solid";
import { For, Index } from "solid-js";
import { createStore } from "solid-js/store";
import type { Task } from "@/lib/types";
import { useUserStore } from "@/stores/user";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { InputGroup, InputGroupInput } from "./ui/input-group";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

export function TasksScreen() {
  const user = useUserStore();
  const reset = useUserStore((state) => state.reset);
  const [newTask, setNewTask] = createStore({
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

      return await response.json();
    },
  }));

  function handleLogOut() {
    reset();
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
          <Dialog>
            <DialogTrigger>
              <Button>Create task</Button>
            </DialogTrigger>
            <DialogContent showCloseButton>
              <DialogHeader>
                <DialogTitle>New task</DialogTitle>
              </DialogHeader>
              <form class="space-y-4">
                <TextField>
                  <TextFieldLabel>Title</TextFieldLabel>
                  <TextFieldInput placeholder="Enter the title..." />
                </TextField>
                <TextField>
                  <TextFieldLabel>Sub tasks</TextFieldLabel>
                  <ul class="space-y-2">
                    <Index each={newTask.subTasks}>
                      {(subTask, index) => (
                        <InputGroup>
                          <InputGroupInput class="w-full" value={subTask()} />
                          <Button
                            size="icon"
                            variant="ghost"
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
                          </Button>
                        </InputGroup>
                      )}
                    </Index>
                  </ul>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setNewTask((prevTask) => ({
                        ...prevTask,
                        subTasks: [...prevTask.subTasks, ""],
                      }))
                    }
                  >
                    <PlusIcon />
                  </Button>
                </TextField>
                <Button type="submit">Create task</Button>
              </form>
            </DialogContent>
          </Dialog>
          <ul class="space-y-2 max-h-100 overflow-y-auto">
            <For each={tasksQuery.data}>
              {(task) => (
                <li class="flex justify-between gap-2 rounded-lg border bg-gray-50 p-2">
                  <div class="w-auto max-w-100">
                    <p class="wrap-anywhere line-clamp-2 font-semibold text-[17px]">
                      {task.title}
                    </p>
                    <ul class="space-y-1">
                      {task.subTasks.map((subTask) => (
                        <p class="wrap-anywhere w-fit rounded-md bg-blue-200 px-2">
                          {subTask}
                        </p>
                      ))}
                    </ul>
                  </div>
                  <DeleteTaskButton taskId={task.id} />
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>
    </>
  );
}
