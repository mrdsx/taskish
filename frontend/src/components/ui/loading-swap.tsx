import { LoaderCircleIcon } from "lucide-solid";
import type { ParentProps } from "solid-js";
import { Match, Switch } from "solid-js";

export function LoadingSwap(props: { isLoading: boolean } & ParentProps) {
  return (
    <Switch>
      <Match when={props.isLoading}>
        <LoaderCircleIcon class="animate-spin" />
      </Match>
      <Match when={!props.isLoading}>{props.children}</Match>
    </Switch>
  );
}
