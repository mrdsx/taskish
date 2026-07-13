import type { SetStoreFunction } from "solid-js/store";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "@/components/ui/text-field";
import type { TaskIn } from "../../types";
import { DIALOG_PADDING } from "./AddTaskDialog";

type TitleFieldProps = {
  title: string;
  disabled: boolean;
  setNewTask: SetStoreFunction<TaskIn>;
};

export function TitleField(props: TitleFieldProps) {
  function handleUpdateTitle(newTitle: string) {
    props.setNewTask((prevTask) => ({
      ...prevTask,
      title: newTitle,
    }));
  }

  return (
    <TextField class={`px-${DIALOG_PADDING}`}>
      <TextFieldLabel>Title</TextFieldLabel>
      <TextFieldInput
        placeholder="Enter the title..."
        value={props.title}
        disabled={props.disabled}
        onInput={(event) => handleUpdateTitle(event.currentTarget.value)}
      />
    </TextField>
  );
}
