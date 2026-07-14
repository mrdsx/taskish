import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { FormErrorView } from "@/components/form-error-view";
import { SubmitButton } from "@/components/submit-button";
import { arraysEqual } from "@/lib/utils";
import { DIALOG_PADDING } from "../../constants";
import { MAX_TITLE_LENGTH } from "../../schemas";
import type { TaskIn } from "../../types";
import { SubTasksField } from "./sub-tasks-field";
import { TitleField } from "./title-field";

type SubmitTaskFormProps = {
  isPending: boolean;
  defaultValues: TaskIn;
  setTask: (taskIn: TaskIn) => void;
};

export function SubmitTaskForm(props: SubmitTaskFormProps) {
  const [formError, setFormError] = createSignal<string | null>(null);
  const [newTask, setNewTask] = createStore<TaskIn>({ ...props.defaultValues });
  const isNewTaskUnchanged = () =>
    props.defaultValues.title === newTask.title &&
    arraysEqual(props.defaultValues.subTasks, newTask.subTasks);

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
    props.setTask(taskIn);
  }

  return (
    <form class="space-y-4" onSubmit={handleSubmit}>
      <TitleField
        title={newTask.title}
        disabled={props.isPending}
        setNewTask={setNewTask}
      />
      <SubTasksField
        subTasks={newTask.subTasks}
        disabled={props.isPending}
        setNewTask={setNewTask}
      />
      <div class={`px-${DIALOG_PADDING}`}>
        <SubmitButton
          class="w-full"
          isLoading={props.isPending}
          disabled={isNewTaskUnchanged()}
        >
          Submit
        </SubmitButton>
      </div>
      <FormErrorView class={`px-${DIALOG_PADDING}`} formError={formError()} />
    </form>
  );
}
