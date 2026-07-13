import { RefreshCwIcon } from "lucide-solid";
import { cx } from "@/lib/utils";
import { Button } from "./ui/button";

export function RefreshButton(props: {
  isRefreshing: boolean;
  refresh: () => void;
}) {
  return (
    <Button
      variant="outline"
      disabled={props.isRefreshing}
      onClick={() => props.refresh()}
    >
      <RefreshCwIcon class={cx(props.isRefreshing && "animate-spin")} />
      Refresh
    </Button>
  );
}
