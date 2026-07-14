import { RefreshCwIcon } from "lucide-solid";
import { Show } from "solid-js";
import { cx } from "@/lib/utils";
import { Button, type ButtonProps } from "./ui/button";

export function RefreshButton(props: {
  size?: ButtonProps["size"];
  isRefreshing: boolean;
  onlyIcon: boolean;
  refresh: () => void;
}) {
  return (
    <Button
      size={props.size}
      variant="outline"
      disabled={props.isRefreshing}
      onClick={() => props.refresh()}
    >
      <RefreshCwIcon class={cx(props.isRefreshing && "animate-spin")} />
      <Show when={!props.onlyIcon}>Refresh</Show>
    </Button>
  );
}
