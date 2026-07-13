import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { createSignal, type Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { SubmitButton } from "@/components/SubmitButton";
import { taskService } from "../../services";
import type { Task, TaskIn } from "../../types";
import { DIALOG_PADDING } from "./AddTaskDialog";
import { SubTasksField } from "./SubTasksField";
import { TitleField } from "./TitleField";

export function AddTaskForm(props: { setIsDialogOpen: Setter<boolean> }) {
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
      props.setIsDialogOpen(false);
    },
  }));

  function handleSubmit(event: SubmitEvent) {
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
    <form class="space-y-4" onSubmit={handleSubmit}>
      <TitleField
        title={newTask.title}
        disabled={addTaskMutation.isPending}
        setNewTask={setNewTask}
      />
      <SubTasksField
        subTasks={newTask.subTasks}
        disabled={addTaskMutation.isPending}
        setNewTask={setNewTask}
      />
      <SubmitButton
        class={`mx-${DIALOG_PADDING}`}
        isLoading={addTaskMutation.isPending}
      >
        Create task
      </SubmitButton>
      <Show when={formError() !== null}>
        <p class={`mx-${DIALOG_PADDING} text-red-500`}>{formError()}</p>
      </Show>
    </form>
  );
}
