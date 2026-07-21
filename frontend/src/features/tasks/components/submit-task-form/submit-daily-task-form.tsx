import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { FormErrorView } from "@/components/form-error-view";
import { SubmitButton } from "@/components/submit-button";
import { arraysEqual } from "@/lib/utils";
import { DIALOG_PADDING } from "../../constants";
import { MAX_TITLE_LENGTH } from "../../schemas";
import type { DailyTaskIn } from "../../types";
import { CompletedField } from "./completed-field";
import { SubTasksField } from "./sub-tasks-field";
import { TitleField } from "./title-field";

type SubmitDailyTaskFormProps = {
  formType: "create" | "update";
  isDisabled: boolean;
  defaultValues: DailyTaskIn;
  onTaskSubmit: (taskIn: DailyTaskIn) => void;
};

export function SubmitDailyTaskForm(props: SubmitDailyTaskFormProps) {
  const [formError, setFormError] = createSignal<string | null>(null);
  const [newTask, setNewTask] = createStore<DailyTaskIn>({
    ...props.defaultValues,
  });
  const isNewTaskUnchanged = () =>
    props.defaultValues.title === newTask.title &&
    arraysEqual(props.defaultValues.subTasks, newTask.subTasks) &&
    props.defaultValues.completed === newTask.completed;

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    const title = newTask.title.trim();
    const subTasks = newTask.subTasks
      .map((subTask) => subTask.trim())
      .filter((subTask) => subTask.length > 0);
    const completed = newTask.completed;
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

    const taskIn: DailyTaskIn = {
      title,
      subTasks,
      completed,
    };
    props.onTaskSubmit(taskIn);
  }

  return (
    <form class="space-y-4" onSubmit={handleSubmit}>
      <TitleField
        title={newTask.title}
        disabled={props.isDisabled}
        setNewTask={setNewTask}
      />
      <SubTasksField
        subTasks={newTask.subTasks}
        disabled={props.isDisabled}
        setNewTask={setNewTask}
      />
      <Show when={props.formType === "update"}>
        <CompletedField
          completed={newTask.completed}
          disabled={props.isDisabled}
          setNewTask={setNewTask}
        />
      </Show>
      <div class={`px-${DIALOG_PADDING}`}>
        <SubmitButton
          class="w-full"
          isLoading={props.isDisabled}
          disabled={isNewTaskUnchanged()}
        >
          Submit
        </SubmitButton>
      </div>
      <FormErrorView class={`px-${DIALOG_PADDING}`} formError={formError()} />
    </form>
  );
}
