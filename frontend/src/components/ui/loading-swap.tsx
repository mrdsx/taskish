import type { ParentProps } from "solid-js";
import { Match, Switch } from "solid-js";
import { Spinner } from "./spinner";

export function LoadingSwap(props: { isLoading: boolean } & ParentProps) {
  return (
    <Switch>
      <Match when={props.isLoading}>
        <Spinner />
      </Match>
      <Match when={!props.isLoading}>{props.children}</Match>
    </Switch>
  );
}
