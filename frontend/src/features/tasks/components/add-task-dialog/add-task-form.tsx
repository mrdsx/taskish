import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { createSignal, type Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { FormErrorView } from "@/components/form-error-view";
import { SubmitButton } from "@/components/submit-button";
import { MAX_TITLE_LENGTH } from "../../schemas";
import { taskService } from "../../services";
import type { Task, TaskIn } from "../../types";
import { DIALOG_PADDING } from "./add-task-dialog";
import { SubTasksField } from "./sub-tasks-field";
import { TitleField } from "./title-field";

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
    if (title.length > MAX_TITLE_LENGTH) {
      setFormError("Too long title");
      return;
    }
    if (subTasks.some((t) => t.length > MAX_TITLE_LENGTH)) {
      setFormError("Too long sub task");
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
      <FormErrorView class={`mx-${DIALOG_PADDING}`} formError={formError()} />
    </form>
  );
}
