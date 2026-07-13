import { PlusIcon, XIcon } from "lucide-solid";
import { Index } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TextField, TextFieldLabel } from "@/components/ui/text-field";
import type { TaskIn } from "../../types";
import { DIALOG_PADDING } from "./add-task-dialog";

type SubTasksFieldProps = {
  subTasks: string[];
  disabled: boolean;
  setNewTask: SetStoreFunction<TaskIn>;
};

export function SubTasksField(props: SubTasksFieldProps) {
  function handleAddSubTask() {
    props.setNewTask((prevTask) => ({
      ...prevTask,
      subTasks: [...prevTask.subTasks, ""],
    }));
    const subTaskInputs = document.querySelectorAll("[data-value='sub-task']");
    const lastInput = subTaskInputs.item(subTaskInputs.length - 1);
    (lastInput as HTMLInputElement).focus();
  }

  function handleUpdateSubTask(newSubTask: string, index: number) {
    props.setNewTask((prevTask) => ({
      ...prevTask,
      subTasks: [
        ...prevTask.subTasks.slice(0, index),
        newSubTask,
        ...prevTask.subTasks.slice(index + 1),
      ],
    }));
  }

  function handleDeleteSubTask(index: number) {
    props.setNewTask((prevTask) => ({
      ...prevTask,
      subTasks: [...prevTask.subTasks.toSpliced(index, 1)],
    }));
  }

  return (
    <TextField>
      <TextFieldLabel class={`px-${DIALOG_PADDING}`}>Sub tasks</TextFieldLabel>
      <ul
        class={`space-y-2 py-0.75 px-${DIALOG_PADDING} max-h-60 overflow-auto`}
      >
        <Index each={props.subTasks}>
          {(subTask, index) => (
            <InputGroup>
              <InputGroupInput
                data-value="sub-task"
                value={subTask()}
                disabled={props.disabled}
                onInput={(event) =>
                  handleUpdateSubTask(event.currentTarget.value, index)
                }
              />
              <InputGroupButton
                disabled={props.disabled}
                onClick={() => handleDeleteSubTask(index)}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroup>
          )}
        </Index>
      </ul>
      <Button
        class={`mx-${DIALOG_PADDING}`}
        size="icon"
        variant="outline"
        disabled={props.disabled}
        onClick={handleAddSubTask}
      >
        <PlusIcon />
      </Button>
    </TextField>
  );
}
