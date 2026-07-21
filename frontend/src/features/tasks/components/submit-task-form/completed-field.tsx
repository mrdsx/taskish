import type { SetStoreFunction } from "solid-js/store";
import {
  Switch,
  SwitchControl,
  SwitchInput,
  SwitchLabel,
  SwitchThumb,
} from "@/components/ui/switch";
import { DIALOG_PADDING } from "../../constants";
import type { DailyTaskIn } from "../../types";

type CompletedFieldProps = {
  completed: boolean;
  disabled: boolean;
  setNewTask: SetStoreFunction<DailyTaskIn>;
};

export function CompletedField(props: CompletedFieldProps) {
  return (
    <Switch
      class={`px-${DIALOG_PADDING}`}
      checked={props.completed}
      disabled={props.disabled}
      onChange={(checked) =>
        props.setNewTask((prevTask) => ({
          ...prevTask,
          completed: checked,
        }))
      }
    >
      <SwitchInput />
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
      <SwitchLabel>Completed</SwitchLabel>
    </Switch>
  );
}
